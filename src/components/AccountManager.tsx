import React, { useState, useEffect } from 'react';
import { 
  UserProfileData, 
  getAllUserProfiles, 
  saveUserProfile, 
  deleteUserProfile,
  defaultProfile,
  adminCreateUser
} from '../lib/firebase';
import * as Lucide from 'lucide-react';

export default function AccountManager() {
  const [profiles, setProfiles] = useState<UserProfileData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterRole, setFilterRole] = useState<string>('all');

  // Creation mode tab
  const [creationTab, setCreationTab] = useState<'single' | 'bulk'>('single');

  // Classes & Enrollment allocations
  const [availableClasses, setAvailableClasses] = useState<{ id: string; name: string; code: string; teacherId: string }[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedBulkClassId, setSelectedBulkClassId] = useState<string>('');

  // Reusable custom modal confirmation state
  const [confirmModal, setConfirmModal] = useState<{
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Single Form states
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('123456');
  const [role, setRole] = useState<'student' | 'teacher' | 'school_admin'>('student');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Bulk Form states
  const [bulkInput, setBulkInput] = useState<string>('');
  const [bulkPassword, setBulkPassword] = useState<string>('123456');
  const [bulkRole, setBulkRole] = useState<'student' | 'teacher' | 'school_admin'>('student');
  const [bulkProgress, setBulkProgress] = useState<{ total: number; current: number; successCount: number; failCount: number } | null>(null);
  const [bulkLogs, setBulkLogs] = useState<string[]>([]);
  const [bulkSubmitting, setBulkSubmitting] = useState<boolean>(false);

  // Load classes from central list
  const loadSharedClasses = () => {
    try {
      const sharedClassesRaw = localStorage.getItem('ic3_classes_shared');
      if (sharedClassesRaw) {
        setAvailableClasses(JSON.parse(sharedClassesRaw));
      } else {
        const defaultClasses = [
          { id: 'cls_01', name: 'Lớp Luyện thi IC3 - Khóa Cơ bản K68', code: 'IC3-K68-BASIC', teacherId: 'usr_teacher_01' },
          { id: 'cls_02', name: 'Tin học Đại cương - Nhóm 5', code: 'THDC-G5', teacherId: 'usr_teacher_01' }
        ];
        localStorage.setItem('ic3_classes_shared', JSON.stringify(defaultClasses));
        setAvailableClasses(defaultClasses);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Helper to dynamically enroll new student into their active classroom roster
  const enrollStudentIntoClass = (classId: string, studentEmail: string, studentName: string, studentId: string) => {
    if (!classId) return;
    try {
      let enrolledCount = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('ic3_classes_')) {
          const classesRaw = localStorage.getItem(key);
          if (classesRaw) {
            const classesList = JSON.parse(classesRaw);
            let updated = false;
            const newClassesList = classesList.map((cls: any) => {
              if (cls.id === classId) {
                if (!cls.students) cls.students = [];
                const exists = cls.students.some((s: any) => s.email.toLowerCase() === studentEmail.toLowerCase());
                if (!exists) {
                  cls.students.push({
                    id: studentId,
                    name: studentName,
                    email: studentEmail.toLowerCase(),
                    completedLessons: 0,
                    avgExamScore: 0,
                    predictedPassRate: 0,
                    streakDays: 0,
                    activityStatus: 'inactive'
                  });
                  cls.studentCount = cls.students.length;
                  updated = true;
                  enrolledCount++;
                }
              }
              return cls;
            });
            if (updated) {
              localStorage.setItem(key, JSON.stringify(newClassesList));
            }
          }
        }
      }
      console.log(`Enrolled into ${enrolledCount} classroom dashboards`);
    } catch (err) {
      console.error("Auto enrollment error:", err);
    }
  };

  // Fetch all accounts
  const loadAccounts = async () => {
    setLoading(true);
    try {
      const data = await getAllUserProfiles();
      setProfiles(data);
    } catch (err) {
      console.error(err);
      setError('Không thể kết nối thời gian thực tới Firebase Database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
    loadSharedClasses();
  }, []);

  // Handle single user allocation
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = fullName.trim();

    if (!trimmedName || !trimmedEmail || !password) {
      setError('Vui lòng nhập đầy đủ thông tin yêu cầu!');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu cấp phát phải từ 6 ký tự trở lên để đáp ứng bảo mật Firebase Auth!');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Địa chỉ email không đúng định dạng chuẩn!');
      return;
    }

    // Check pre-existing state in UI cache
    const duplicate = profiles.find(p => p.email.toLowerCase() === trimmedEmail);
    if (duplicate) {
      setError(`Email "${trimmedEmail}" đã được liên kết với một tài khoản khác!`);
      return;
    }

    setSubmitting(true);
    let realUid = '';
    let isFallback = false;

    try {
      // 1. Create in Firebase Auth directly using our non-logout helper
      try {
        realUid = await adminCreateUser(trimmedEmail, password);
      } catch (authErr: any) {
        console.warn("Direct Firebase authentication failed. Falling back to local database creation:", authErr);
        // Fallback to purely Firestore based UID which works with our high-speed AuthScreen fallback lookup
        realUid = 'db_' + Math.random().toString(36).substring(2, 10);
        isFallback = true;
      }

      // Read selected class details
      let targetClassName = '';
      if (role === 'student' && selectedClassId) {
        const matchedClass = availableClasses.find(c => c.id === selectedClassId);
        if (matchedClass) {
          targetClassName = matchedClass.name;
        }
      }

      // 2. Build profile matching that precise UID
      const newProfile: UserProfileData = {
        ...defaultProfile(realUid, trimmedEmail, trimmedName, role),
        gradeClass: targetClassName || '',
        password: password // Keep original password displayable for teachers' lookup
      };

      // 3. Save profile structure to Firestore
      await saveUserProfile(realUid, newProfile);

      // 4. If student, enroll into class roster
      if (role === 'student' && selectedClassId) {
        enrollStudentIntoClass(selectedClassId, trimmedEmail, trimmedName, realUid);
      }
      
      setSuccess(`Đã cấp phát thành công tài khoản "${trimmedName}" liên kết trực tuyến! ${isFallback ? '(Bản lưu trữ đám mây đặc cách)' : ''} Người dùng đã có thể đăng nhập ngay bằng mật khẩu "${password}".`);
      
      // Clear form fields
      setFullName('');
      setEmail('');
      setPassword('123456');
      setRole('student');
      setSelectedClassId('');
      
      // Auto-reload
      await loadAccounts();
    } catch (err: any) {
      console.error(err);
      let errMsg = err.message || 'Lỗi kết nối Firebase.';
      if (err.code === 'auth/email-already-in-use') {
        errMsg = 'Tài khoản email này đã được sử dụng.';
      } else if (err.code === 'auth/weak-password') {
        errMsg = 'Mật khẩu quá yếu.';
      }
      setError('Lỗi khi thiết lập tài khoản: ' + errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to copy text to clipboard for convenience
  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    // Silent success
  };

  // Process bulk list
  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setBulkLogs([]);

    const lines = bulkInput.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) {
      setError('Vui lòng nhập nội dung danh sách thành viên!');
      return;
    }

    if (bulkPassword.length < 6) {
      setError('Mật khẩu khởi tạo chung phải tối thiểu 6 ký tự!');
      return;
    }

    setBulkSubmitting(true);
    setBulkProgress({ total: lines.length, current: 0, successCount: 0, failCount: 0 });

    const newLogs: string[] = [];
    let successes = 0;
    let failures = 0;

    const logAndSet = (msg: string) => {
      newLogs.push(msg);
      setBulkLogs([...newLogs]);
    };

    logAndSet(`⚡ Bắt đầu tiến trình tạo hàng loạt ${lines.length} tài khoản...`);

    for (let i = 0; i < lines.length; i++) {
      const activeLine = lines[i];
      setBulkProgress(prev => prev ? { ...prev, current: i + 1 } : null);

      let parsedName = '';
      let parsedEmail = '';

      // Check if CSV format (comma-separated: Name, Email)
      if (activeLine.includes(',')) {
        const parts = activeLine.split(',');
        parsedName = parts[0].trim();
        parsedEmail = parts[1].trim().toLowerCase();
      } else {
        // Assume single word/email format
        parsedEmail = activeLine.trim().toLowerCase();
        // Generate name from early portion of email
        const emailPrefix = parsedEmail.split('@')[0];
        parsedName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
      }

      // Quick validate on email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!parsedEmail || !emailRegex.test(parsedEmail)) {
        logAndSet(`❌ Dòng ${i+1}: Email "${parsedEmail}" không hợp lệ. Bỏ qua.`);
        failures++;
        setBulkProgress(prev => prev ? { ...prev, failCount: failures } : null);
        continue;
      }

      logAndSet(`⏳ [${i+1}/${lines.length}] Đang tạo: "${parsedName}" <${parsedEmail}>...`);

      try {
        // Check duplicate
        const isExists = profiles.some(p => p.email.toLowerCase() === parsedEmail);
        if (isExists) {
          logAndSet(`⚠️ Email "${parsedEmail}" đã có sẵn trên hệ thống. Tránh trùng lặp.`);
          failures++;
          setBulkProgress(prev => prev ? { ...prev, failCount: failures } : null);
          continue;
        }

        // 1. Create user in authentication (with database fallback)
        let uid = '';
        let isFallback = false;
        try {
          uid = await adminCreateUser(parsedEmail, bulkPassword);
        } catch (authErr: any) {
          console.warn("Bulk Firebase authentication failed, using database placement fallback:", authErr);
          uid = 'db_' + Math.random().toString(36).substring(2, 10);
          isFallback = true;
        }

        // Get class details
        let targetBulkClassName = '';
        if (bulkRole === 'student' && selectedBulkClassId) {
          const matchedClass = availableClasses.find(c => c.id === selectedBulkClassId);
          if (matchedClass) {
            targetBulkClassName = matchedClass.name;
          }
        }

        // 2. Build Profile
        const profileInstance = {
          ...defaultProfile(uid, parsedEmail, parsedName, bulkRole),
          gradeClass: targetBulkClassName || '',
          password: bulkPassword // Saved for clear back-lookup
        };

        // 3. Write Firestore
        await saveUserProfile(uid, profileInstance);

        // 4. Enroll in class roster
        if (bulkRole === 'student' && selectedBulkClassId) {
          enrollStudentIntoClass(selectedBulkClassId, parsedEmail, parsedName, uid);
        }

        logAndSet(`✅ Thành công: Cấp phát tài năng học liệu UID ${uid.substring(0, 6)} cho "${parsedName}" ${isFallback ? '(DB Fallback)' : ''}`);
        successes++;
        setBulkProgress(prev => prev ? { ...prev, successCount: successes } : null);
      } catch (err: any) {
        console.error(err);
        logAndSet(`❌ Lỗi dòng ${i+1}: ${err.message || 'Lỗi Firebase unspecified'}`);
        failures++;
        setBulkProgress(prev => prev ? { ...prev, failCount: failures } : null);
      }
    }

    logAndSet(`🎉 Hoàn tất tiến trình! Đã tạo thành công ${successes}/${lines.length} tài khoản.`);
    setSuccess(`Nhập hàng loạt hoàn tất! Đã tạo thành công ${successes} tài khoản mới với mật khẩu thiết lập chung là "${bulkPassword}".`);
    setBulkInput('');
    setSelectedBulkClassId('');
    setBulkSubmitting(false);
    
    // Refresh table
    await loadAccounts();
  };

  // Delete profile from Firestore
  const handleDelete = async (userId: string, name: string) => {
    setConfirmModal({
      message: `Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản của "${name}" khỏi cơ sở dữ liệu học liệu không?`,
      onConfirm: async () => {
        setError(null);
        setSuccess(null);
        try {
          await deleteUserProfile(userId);
          setSuccess(`Đã xóa thành công thông tin hồ sơ của "${name}"!`);
          await loadAccounts();
        } catch (err: any) {
          console.error(err);
          setError('Lỗi khi thu hồi tài khoản: ' + err.message);
        }
      }
    });
  };

  // Filter database lists
  const filteredProfiles = profiles.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const isSuperBao = p.email.toLowerCase() === 'nguyenbao22013@gmail.com' || p.email.toLowerCase() === 'nguyenbao42013@gmail.com';
    let pRole = p.role;
    if (isSuperBao) {
      pRole = 'school_admin'; // Treat specialized superadmin as admin in filters
    }

    if (filterRole === 'all') return matchesSearch;
    return matchesSearch && pRole === filterRole;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-tr from-indigo-50 to-indigo-100 border border-indigo-200/85 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold font-mono tracking-wider text-indigo-500 uppercase block">TỔNG SỐ THÀNH VIÊN</span>
            <span className="text-2xl font-extrabold text-slate-800">{profiles.length}</span>
          </div>
          <div className="p-3 bg-white text-indigo-600 rounded-xl shadow-3xs">
            <Lucide.Users className="h-5 w-5" />
          </div>
        </div>
        <div className="bg-gradient-to-tr from-emerald-50 to-emerald-100 border border-emerald-200/85 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold font-mono tracking-wider text-emerald-600 uppercase block font-bold">HỌC VIÊN (STUDENT)</span>
            <span className="text-2xl font-extrabold text-slate-800">
              {profiles.filter(p => p.role === 'student' && p.email !== 'nguyenbao22013@gmail.com' && p.email !== 'nguyenbao42013@gmail.com').length}
            </span>
          </div>
          <div className="p-3 bg-white text-emerald-600 rounded-xl shadow-3xs">
            <Lucide.GraduationCap className="h-5 w-5" />
          </div>
        </div>
        <div className="bg-gradient-to-tr from-sky-50 to-sky-100 border border-slate-200/80 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold font-mono tracking-wider text-sky-600 uppercase block font-bold">GIÁO VIÊN (TEACHER)</span>
            <span className="text-2xl font-extrabold text-slate-800">
              {profiles.filter(p => p.role === 'teacher').length}
            </span>
          </div>
          <div className="p-3 bg-white text-sky-600 rounded-xl shadow-3xs">
            <Lucide.BookOpen className="h-5 w-5" />
          </div>
        </div>
        <div className="bg-gradient-to-tr from-rose-50 to-rose-100 border border-rose-200/85 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold font-mono tracking-wider text-rose-500 uppercase block font-bold">QUẢN TRỊ VIÊN (ADMIN)</span>
            <span className="text-2xl font-extrabold text-slate-800">
              {profiles.filter(p => p.role === 'school_admin' || p.email === 'nguyenbao22013@gmail.com' || p.email === 'nguyenbao42013@gmail.com').length}
            </span>
          </div>
          <div className="p-3 bg-white text-rose-600 rounded-xl shadow-3xs">
            <Lucide.ShieldCheck className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Creator panel (Left: 4 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl shadow-3xs overflow-hidden">
          
          {/* TAB HEADERS FOR CREATION TYPE */}
          <div className="flex border-b border-slate-200 bg-slate-50">
            <button
              onClick={() => setCreationTab('single')}
              className={`flex-1 py-3 px-4 text-xs font-bold font-sans flex items-center justify-center gap-1.5 transition-all outline-none ${
                creationTab === 'single'
                  ? 'bg-white border-b-2 border-indigo-600 text-indigo-700'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
              }`}
            >
              <Lucide.UserPlus className="h-4 w-4" />
              TẠO ĐƠN LẺ
            </button>
            <button
              onClick={() => setCreationTab('bulk')}
              className={`flex-1 py-3 px-4 text-xs font-bold font-sans flex items-center justify-center gap-1.5 transition-all outline-none ${
                creationTab === 'bulk'
                  ? 'bg-white border-b-2 border-indigo-600 text-indigo-700'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
              }`}
            >
              <Lucide.FileSpreadsheet className="h-4 w-4" />
              NHẬP HÀNG LOẠT
            </button>
          </div>

          <div className="p-5 space-y-4">
            
            {/* Success / Error alerts inside form */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-250 text-rose-800 rounded-xl text-xs font-semibold flex items-start gap-1.5 animate-fadeIn">
                <Lucide.AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-xl text-xs font-semibold flex items-start gap-1.5 animate-fadeIn">
                <Lucide.CheckCircle className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            {/* TAB 1: SINGLE PROVISION */}
            {creationTab === 'single' && (
              <form onSubmit={handleCreateAccount} className="space-y-4">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 block">
                  <span className="text-[10px] font-bold text-slate-700 block">💡 Tạo trực tiếp Authentication:</span>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    Tài khoản được ghi danh lập tức vào <strong>Firebase Authentication</strong>. Học viên có thể đăng nhập tức thì bằng email và mật khẩu được cấp mà không cần qua bước Handshake tạm thời nào.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black font-mono text-slate-500 uppercase tracking-wider block">HỌ VÀ TÊN THÀNH VIÊN</label>
                  <div className="relative">
                    <Lucide.User className="absolute left-3.5 top-3.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Nguyễn Văn Hải"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-3 pl-9 outline-none focus:border-indigo-500 focus:bg-white"
                      id="admin-single-fullname"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black font-mono text-slate-500 uppercase tracking-wider block">EMAIL LIÊN KẾT ĐĂNG NHẬP</label>
                  <div className="relative">
                    <Lucide.Mail className="absolute left-3.5 top-3.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="hainguyen@vietnam.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-3 pl-9 outline-none focus:border-indigo-500 focus:bg-white"
                      id="admin-single-email"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black font-mono text-slate-500 uppercase tracking-wider block">MẬT KHẨU KHỞI TẠO</label>
                  <div className="relative">
                    <Lucide.KeyRound className="absolute left-3.5 top-3.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Tối thiểu 6 ký tự"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full text-xs font-bold font-mono text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-3 pl-9 outline-none focus:border-indigo-500 focus:bg-white"
                      id="admin-single-password"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black font-mono text-slate-500 uppercase tracking-wider block">VAI TRÒ TRỰC THUỘC</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setRole('student')}
                      className={`p-2 rounded-xl border text-[10px] font-black uppercase transition-all ${
                        role === 'student' 
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-800 ring-2 ring-emerald-50' 
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600'
                      }`}
                    >
                      HỌC VIÊN
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('teacher')}
                      className={`p-2 rounded-xl border text-[10px] font-black uppercase transition-all ${
                        role === 'teacher' 
                          ? 'bg-indigo-50 border-indigo-600 text-indigo-800 ring-2 ring-indigo-50' 
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600'
                      }`}
                    >
                      GIÁO VIÊN
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('school_admin')}
                      className={`p-2 rounded-xl border text-[10px] font-black uppercase transition-all ${
                        role === 'school_admin' 
                          ? 'bg-rose-50 border-rose-600 text-rose-800 ring-2 ring-rose-50' 
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600'
                      }`}
                    >
                      QUẢN TRỊ
                    </button>
                  </div>
                </div>

                {role === 'student' && (
                  <div className="space-y-1.5 animate-fadeIn">
                    <label className="text-[10px] font-black font-mono text-indigo-600 uppercase tracking-wider block flex items-center gap-1 mt-1">
                      <Lucide.GraduationCap className="h-3.5 w-3.5 shrink-0" />
                      PHÂN VÀO LỚP HỌC KHỞI CHẠY (STUDENT PRE-ASSIGN)
                    </label>
                    <select
                      value={selectedClassId}
                      onChange={(e) => setSelectedClassId(e.target.value)}
                      className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-indigo-500 focus:bg-white"
                      id="admin-single-class-select"
                    >
                      <option value="">-- Để học tự do (Chờ tự nhập mã mời) --</option>
                      {availableClasses.map((cls) => (
                        <option key={cls.id} value={cls.id}>{cls.name} (Mã: {cls.code})</option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full text-xs bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-black py-3 rounded-xl transition shadow-3xs flex items-center justify-center gap-1.5"
                >
                  {submitting ? (
                    <Lucide.Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Lucide.PlusCircle className="h-4 w-4" />
                      KÍCH HOẠT TÀI KHOẢN NGAY
                    </>
                  )}
                </button>
              </form>
            )}

            {/* TAB 2: BULK IMPORTER */}
            {creationTab === 'bulk' && (
              <form onSubmit={handleBulkImport} className="space-y-4">
                <div className="bg-gradient-to-tr from-amber-50 to-amber-100 border border-amber-200 p-3 rounded-xl space-y-1 block">
                  <span className="text-[10px] font-bold text-amber-900 block flex items-center gap-1">
                    <Lucide.AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                    Cú pháp nhập danh sách hàng loạt:
                  </span>
                  <p className="text-[10px] text-amber-800 leading-normal font-medium">
                    Hãy nhập mỗi học viên 1 dòng theo các định dạng sau:<br />
                    • Định dạng A (Nhận dạng cả hai): <code>Họ và Tên, email@gmail.com</code><br />
                    • Định dạng B: <code>email_hocsinh@gmail.com</code> (Tên sẽ tự động khởi tạo từ ID email)
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black font-mono text-slate-500 uppercase tracking-wider block">
                    DANH SÁCH THÀNH VIÊN ({bulkInput.split('\n').filter(Boolean).length} DÒNG)
                  </label>
                  <textarea
                    required
                    rows={6}
                    placeholder="Ví dụ:&#13;Nguyễn Văn Minh, minhnguyen@gmail.com&#13;Trần Thị Thu, thutran@gmail.com&#13;student3@gmail.com"
                    value={bulkInput}
                    onChange={(e) => setBulkInput(e.target.value)}
                    className="w-full text-xs font-bold font-mono text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-indigo-500 focus:bg-white resize-y"
                    id="admin-bulk-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black font-mono text-slate-500 uppercase tracking-wider block">MẬT KHẨU CHUNG</label>
                    <input
                      type="text"
                      required
                      placeholder="Mặc định: 123456"
                      value={bulkPassword}
                      onChange={(e) => setBulkPassword(e.target.value)}
                      className="w-full text-xs font-bold font-mono text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-indigo-500 focus:bg-white"
                      id="admin-bulk-password"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black font-mono text-slate-500 uppercase tracking-wider block">VAI TRÒ KHỞI TẠO</label>
                    <select
                      value={bulkRole}
                      onChange={(e) => setBulkRole(e.target.value as any)}
                      className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-indigo-500 focus:bg-white"
                      id="admin-bulk-role"
                    >
                      <option value="student">Học viên (Student)</option>
                      <option value="teacher">Giáo viên (Teacher)</option>
                      <option value="school_admin">Quản trị viên (Admin)</option>
                    </select>
                  </div>
                </div>

                {bulkRole === 'student' && (
                  <div className="space-y-1.5 animate-fadeIn">
                    <label className="text-[10px] font-black font-mono text-indigo-600 uppercase tracking-wider block flex items-center gap-1 mt-1">
                      <Lucide.GraduationCap className="h-3.5 w-3.5 shrink-0" />
                      PHÂN HỌC VIÊN VÀO LỚP CHỈ ĐỊNH CHUNG (BULK PRE-ASSIGN)
                    </label>
                    <select
                      value={selectedBulkClassId}
                      onChange={(e) => setSelectedBulkClassId(e.target.value)}
                      className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-indigo-500 focus:bg-white"
                      id="admin-bulk-class-select"
                    >
                      <option value="">-- Để học tự do (Chờ tự nhập mã mời) --</option>
                      {availableClasses.map((cls) => (
                        <option key={cls.id} value={cls.id}>{cls.name} (Mã: {cls.code})</option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={bulkSubmitting}
                  className="w-full text-xs bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-black py-3 rounded-xl transition shadow-3xs flex items-center justify-center gap-1.5"
                >
                  {bulkSubmitting ? (
                    <Lucide.Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Lucide.CheckSquare className="h-4 w-4" />
                      KÍCH HOẠT NHẬP HÀNG LOẠT
                    </>
                  )}
                </button>

                {/* Live Progress logger */}
                {bulkProgress && (
                  <div className="bg-slate-900 text-slate-100 rounded-xl p-3.5 font-mono text-[10px] space-y-2.5 shadow-inner">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <span className="font-bold text-indigo-400">📊 TIẾN TRÌNH THỰC THI</span>
                      <span className="text-slate-400">
                        {bulkProgress.current} / {bulkProgress.total} hoàn thành
                      </span>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-indigo-500 h-1.5 transition-all duration-300" 
                        style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-slate-400 font-bold border-b border-slate-800 pb-1.5">
                      <span className="text-emerald-400">Thành công: {bulkProgress.successCount}</span>
                      <span className="text-rose-400">Lỗi: {bulkProgress.failCount}</span>
                    </div>
                    {/* Logs output */}
                    <div className="max-h-36 overflow-y-auto space-y-1 block pr-1 leading-relaxed text-slate-300">
                      {bulkLogs.map((log, index) => (
                        <div key={index} className="truncate">{log}</div>
                      ))}
                    </div>
                  </div>
                )}
              </form>
            )}

          </div>
        </div>

        {/* Database List Panel (Right: 7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-3xs space-y-4">
          
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Lucide.ShieldCheck className="h-4.5 w-4.5 text-indigo-600" />
              <h3 className="text-xs font-black font-mono tracking-widest text-slate-400 uppercase">
                DANH SÁCH BẢO MẬT ({filteredProfiles.length} TÀI KHOẢN CHỌN)
              </h3>
            </div>
            <button
              onClick={loadAccounts}
              disabled={loading}
              className="text-[10px] self-start font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-xl transition"
            >
              <Lucide.RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
              LÀM MỚI BẢO MẬT
            </button>
          </div>

          {/* Filters & search bars */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
            <div className="md:col-span-7 relative">
              <Lucide.Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm tên hoặc địa chỉ email cá nhân..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 outline-none focus:border-indigo-500 focus:bg-white"
                id="admin-search-users"
              />
            </div>
            <div className="md:col-span-5">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 outline-none focus:border-indigo-500 focus:bg-white"
                id="admin-filter-role"
              >
                <option value="all">Lọc vai trò: Tất cả</option>
                <option value="student">Lọc vai trò: Học viên (Student)</option>
                <option value="teacher">Lọc vai trò: Giáo viên (Teacher)</option>
                <option value="school_admin">Lọc vai trò: Quản trị (Admin)</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <Lucide.Loader2 className="h-8 w-8 text-indigo-600 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-bold font-mono">Đang truy vấn thời gian thực từ Firestore...</p>
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 border border-slate-200 rounded-xl">
              <Lucide.Inbox className="h-10 w-10 text-slate-350 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-bold font-mono">Không tìm thấy tài khoản phù hợp với tìm kiếm.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="min-w-full text-xs text-left text-slate-700 font-sans">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700 uppercase select-none">
                  <tr>
                    <th className="px-4 py-3">Tên thành viên</th>
                    <th className="px-4 py-3">Email cá nhân</th>
                    <th className="px-5 py-3 text-center">Vai Trò</th>
                    <th className="px-4 py-3 text-center">Mật khẩu khởi tạo</th>
                    <th className="px-4 py-3 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {filteredProfiles.map((p) => {
                    const isBao = p.email.toLowerCase() === 'nguyenbao22013@gmail.com' || p.email.toLowerCase() === 'nguyenbao42013@gmail.com';
                    return (
                      <tr key={p.id} className="hover:bg-slate-55/40 text-slate-800 transition">
                        <td className="px-4 py-3">
                          <div className="font-bold">{p.name}</div>
                          <div className="text-[9px] text-slate-400 font-mono tracking-tight font-medium">ID: {p.id.substring(0, 8)}...</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-[10.5px] text-slate-600 font-bold">{p.email}</span>
                            <button 
                              onClick={() => handleCopyText(p.email)}
                              className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded transition"
                              title="Sao chép email"
                            >
                              <Lucide.Copy className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className={`text-[9px] uppercase px-2 py-0.5 font-mono border rounded-md font-black tracking-wide ${
                            isBao
                              ? 'bg-amber-50 text-amber-700 border-amber-250 animate-pulse'
                              : p.role === 'school_admin'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : p.role === 'teacher'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-250'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-250'
                          }`}>
                            {isBao ? 'Admin đặc cách' : p.role === 'school_admin' ? 'Admin' : p.role === 'teacher' ? 'Giáo viên' : 'Học viên'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1.5 font-mono text-[11px] font-bold">
                            <span className="text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg">
                              {p.password || '••••••'}
                            </span>
                            {p.password && (
                              <button 
                                onClick={() => handleCopyText(p.password || '')}
                                className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded transition"
                                title="Sao chép mật khẩu"
                              >
                                <Lucide.Copy className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            disabled={isBao}
                            className={`p-2 rounded-lg border text-xs font-bold transition ${
                              isBao 
                                ? 'opacity-30 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200' 
                                : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200 hover:border-rose-300 ring-offset-2 hover:ring-2 hover:ring-rose-200'
                            }`}
                            title={isBao ? 'Không thể can thiệp tài khoản tối cao' : 'Xóa vĩnh viễn'}
                          >
                            <Lucide.Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl text-[10.5px] leading-normal text-slate-500 font-medium space-y-1 block">
            <span className="font-bold text-slate-700 block">💡 Cơ chế Quản lý & Cấp phát Tài khoản IC3:</span>
            <p>
              • Khi bạn nhấn <strong>"TẠO ĐƠN LẺ"</strong> hoặc <strong>"NHẬP HÀNG LOẠT"</strong>, hệ thống tự động hoàn thiện quy trình bảo mật (Authentication) và chuyển giao ID duy nhất bảo mật tuyệt đối cho học viên và giáo viên.<br />
              • Học sinh và giáo viên sử dụng chính Email và Mật khẩu khởi tạo được cấp ở bảng trên để đăng nhập trực tiếp trên thiết bị cá nhân mà không còn lo gặp lỗi handshake mật khẩu!
            </p>
          </div>
        </div>

      </div>

      {/* Reusable Custom Modal Confirmation Overlay */}
      {confirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-scaleUp">
            <div className="p-5 space-y-4">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                <Lucide.AlertTriangle className="h-6 w-6" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-sm font-black font-sans text-slate-800">Xác Nhận Hành Động Hủy Diệt</h3>
                <p className="text-xs text-slate-500 leading-normal font-bold">
                  {confirmModal.message}
                </p>
              </div>
            </div>
            <div className="flex bg-slate-50 border-t border-slate-100 p-3.5 gap-2">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 px-3 py-2.5 rounded-xl transition"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(null);
                }}
                className="flex-1 text-xs font-black bg-rose-600 hover:bg-rose-700 text-white px-3 py-2.5 rounded-xl transition shadow-3xs"
              >
                Chắc chắn xóa
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
