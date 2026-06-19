import React, { useState } from 'react';
import { ClassGroup } from '../types';
import { MOCK_TEACHER_CLASSES } from '../lmsData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import * as Lucide from 'lucide-react';

interface TeacherDashboardProps {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export default function TeacherDashboard({ user }: TeacherDashboardProps) {
  const teacherId = user?.id || 'default_teacher';
  
  // Load real classes created by the teacher from localStorage (or starts empty!)
  const [classes, setClasses] = useState<ClassGroup[]>(() => {
    const saved = localStorage.getItem(`ic3_classes_${teacherId}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    // Default to empty array as requested: "Tôi chưa tạo lớp nào mà sao có sẵn dữ liệu"
    return [];
  });

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [newClassName, setNewClassName] = useState<string>('');
  const [inviteCodeCreated, setInviteCodeCreated] = useState<string>('');

  // Custom confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Form states for manual student creation within active class
  const [showAddStudentForm, setShowAddStudentForm] = useState<boolean>(false);
  const [studName, setStudName] = useState<string>('');
  const [studEmail, setStudEmail] = useState<string>('');
  const [studScore, setStudScore] = useState<number>(0);
  const [studLessons, setStudLessons] = useState<number>(0);

  const activeClass = classes.find((c) => c.id === selectedClassId);

  // Synchronize helper
  const saveClasses = (updatedClasses: ClassGroup[]) => {
    setClasses(updatedClasses);
    localStorage.setItem(`ic3_classes_${teacherId}`, JSON.stringify(updatedClasses));
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    // Generate clean invite code
    const generatedCode = 'IC3-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const newClass: ClassGroup = {
      id: 'cls_' + Date.now(),
      name: newClassName.trim(),
      code: generatedCode,
      teacherId: teacherId,
      studentCount: 0,
      averageScore: 0,
      students: [],
      assignments: []
    };

    const updated = [...classes, newClass];
    saveClasses(updated);
    
    // Sync to shared classes
    try {
      const sharedClassesRaw = localStorage.getItem('ic3_classes_shared') || '[]';
      const sharedClasses = JSON.parse(sharedClassesRaw);
      sharedClasses.push({ id: newClass.id, name: newClass.name, code: newClass.code, teacherId: newClass.teacherId });
      localStorage.setItem('ic3_classes_shared', JSON.stringify(sharedClasses));
    } catch (err) {
      console.error("Shared sync error:", err);
    }

    setSelectedClassId(newClass.id);
    setInviteCodeCreated(generatedCode);
    setNewClassName('');
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClass || !studName.trim() || !studEmail.trim()) return;

    // Direct mathematical formula to predict Certiport pass rate (700 is pass mark)
    const predictedPass = Math.min(100, Math.max(0, Math.floor((studScore / 1000) * 100 + (studLessons * 3))));
    const status = studScore < 500 ? 'at_risk' : studScore < 700 ? 'inactive' : 'active';

    const newStudent = {
      id: 'stud_' + Date.now(),
      name: studName.trim(),
      email: studEmail.trim().toLowerCase(),
      completedLessons: studLessons,
      avgExamScore: Math.min(1000, Math.max(0, studScore)),
      predictedPassRate: predictedPass,
      streakDays: Math.floor(Math.random() * 5),
      activityStatus: status as 'active' | 'inactive' | 'at_risk'
    };

    const updatedStudents = [...activeClass.students, newStudent];
    const totalScore = updatedStudents.reduce((acc, curr) => acc + curr.avgExamScore, 0);
    const avgScore = updatedStudents.length > 0 ? Math.floor(totalScore / updatedStudents.length) : 0;

    const updatedClasses = classes.map((cls) => {
      if (cls.id === activeClass.id) {
        return {
          ...cls,
          studentCount: updatedStudents.length,
          averageScore: avgScore,
          students: updatedStudents
        };
      }
      return cls;
    });

    saveClasses(updatedClasses);

    // Reset form
    setStudName('');
    setStudEmail('');
    setStudScore(0);
    setStudLessons(0);
    setShowAddStudentForm(false);
  };

  // Allow loading mock demo classes if explicitly clicked
  const handleLoadDemoClasses = () => {
    saveClasses(MOCK_TEACHER_CLASSES);
    
    // Sync mocks to shared classes
    try {
      const sharedClassesRaw = localStorage.getItem('ic3_classes_shared') || '[]';
      const sharedClasses = JSON.parse(sharedClassesRaw);
      MOCK_TEACHER_CLASSES.forEach(mc => {
        if (!sharedClasses.some((s: any) => s.id === mc.id)) {
          sharedClasses.push({ id: mc.id, name: mc.name, code: mc.code, teacherId: mc.teacherId });
        }
      });
      localStorage.setItem('ic3_classes_shared', JSON.stringify(sharedClasses));
    } catch (err) {}

    if (MOCK_TEACHER_CLASSES.length > 0) {
      setSelectedClassId(MOCK_TEACHER_CLASSES[0].id);
    }
  };

  const handleClearAllClasses = () => {
    setConfirmModal({
      message: "Bạn có chắc chắn muốn xóa toàn bộ tất cả các lớp học hiện tại cùng danh sách học sinh đính kèm?",
      onConfirm: () => {
        saveClasses([]);
        setSelectedClassId('');
        
        // Clear from shared classes
        try {
          const sharedClassesRaw = localStorage.getItem('ic3_classes_shared') || '[]';
          let sharedClasses = JSON.parse(sharedClassesRaw);
          sharedClasses = sharedClasses.filter((s: any) => s.teacherId !== teacherId);
          localStorage.setItem('ic3_classes_shared', JSON.stringify(sharedClasses));
        } catch (e) {}
      }
    });
  };

  const handleDeleteSingleClass = (classId: string) => {
    const targetClass = classes.find(c => c.id === classId);
    setConfirmModal({
      message: `Bạn có chắc chắn muốn xóa lớp học "${targetClass?.name || 'này'}" cùng với danh sách toàn bộ học sinh đính kèm không?`,
      onConfirm: () => {
        const updated = classes.filter((c) => c.id !== classId);
        saveClasses(updated);
        setSelectedClassId(updated[0]?.id || '');

        // Remove from shared classes
        try {
          const sharedClassesRaw = localStorage.getItem('ic3_classes_shared') || '[]';
          const sharedClasses = JSON.parse(sharedClassesRaw);
          const filtered = sharedClasses.filter((s: any) => s.id !== classId);
          localStorage.setItem('ic3_classes_shared', JSON.stringify(filtered));
        } catch (e) {}
      }
    });
  };

  const handleDeleteStudent = (studentId: string) => {
    if (!activeClass) return;
    const targetStudent = activeClass.students.find(s => s.id === studentId);
    setConfirmModal({
      message: `Bạn có chắc chắn muốn xóa học sinh "${targetStudent?.name || 'này'}" ra khỏi danh sách lớp học?`,
      onConfirm: () => {
        const updatedStudents = activeClass.students.filter(s => s.id !== studentId);
        const totalScore = updatedStudents.reduce((acc, curr) => acc + curr.avgExamScore, 0);
        const avgScore = updatedStudents.length > 0 ? Math.floor(totalScore / updatedStudents.length) : 0;

        const updatedClasses = classes.map((cls) => {
          if (cls.id === activeClass.id) {
            return {
              ...cls,
              studentCount: updatedStudents.length,
              averageScore: avgScore,
              students: updatedStudents
            };
          }
          return cls;
        });

        saveClasses(updatedClasses);
      }
    });
  };

  // Compute stats for charts based on students in active class
  const chartData = activeClass?.students.map((st) => ({
    name: st.name.split(' ').pop() || '',
    'Điểm Thi Thử': st.avgExamScore,
    'Tỷ Lệ Đỗ Dự Báo (%)': st.predictedPassRate
  })) || [];

  // Compute overall totals
  const totalStudentsCount = classes.reduce((acc, curr) => acc + curr.studentCount, 0);
  const totalPassedCount = classes.reduce((acc, curr) => 
    acc + curr.students.filter(s => s.avgExamScore >= 700).length, 0);
  const atRiskCount = classes.reduce((acc, curr) => 
    acc + curr.students.filter(s => s.activityStatus === 'at_risk').length, 0);

  return (
    <div className="space-y-6">
      {/* Upper overview stats - Bright theme */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-3xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold font-mono text-slate-400 block uppercase">Hệ Thống Lớp Đang Dạy</span>
            <span className="text-xl font-extrabold text-slate-800">{classes.length} Lớp đang quản lý</span>
          </div>
          <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
            <Lucide.GraduationCap className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-3xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold font-mono text-slate-400 block uppercase">Tổng Học Viên Thực Tế</span>
            <span className="text-xl font-extrabold text-emerald-600">{totalStudentsCount} Học viên</span>
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl">
            <Lucide.CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-3xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold font-mono text-slate-400 block uppercase">Cảnh báo Học Lực Yếu</span>
            <span className="text-xl font-extrabold text-rose-600">{atRiskCount} Học viên At-Risk</span>
          </div>
          <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl">
            <Lucide.AlertOctagon className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Classroom Creator Option & Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Class management panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-3xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Lucide.Layers className="h-4 w-4 text-indigo-600" />
                <h3 className="text-xs font-bold font-mono tracking-widest text-slate-400 uppercase">
                  DANH SÁCH LỚP HỌC
                </h3>
              </div>
              {classes.length > 0 && (
                <button 
                  onClick={handleClearAllClasses}
                  className="text-[10px] font-bold text-rose-600 hover:text-rose-800 transition"
                  title="Xóa tất cả các lớp học"
                >
                  Xóa tất cả
                </button>
              )}
            </div>

            {classes.length > 0 ? (
               <div className="space-y-2">
                 {classes.map((cls) => (
                   <div
                     key={cls.id}
                     onClick={() => {
                       setSelectedClassId(cls.id);
                       setInviteCodeCreated('');
                     }}
                     className={`w-full text-left p-3.5 rounded-xl border text-xs font-medium transition flex items-center justify-between gap-3 cursor-pointer group/item ${
                       cls.id === selectedClassId
                         ? 'bg-indigo-50 border-indigo-600 text-indigo-800 ring-2 ring-indigo-50'
                         : 'bg-slate-50/50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                     }`}
                     id={`btn-teach-${cls.id}`}
                   >
                     <div className="flex-1 min-w-0">
                       <h4 className="font-bold text-slate-800 truncate">{cls.name}</h4>
                       <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                         Mã liên kết: <span className="font-bold text-indigo-600">{cls.code}</span>
                       </span>
                     </div>
                     <div className="flex items-center gap-2 shrink-0">
                       <span className="text-[11px] font-mono font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                         {cls.studentCount} HS
                       </span>
                       <button
                         type="button"
                         onClick={(e) => {
                           e.stopPropagation();
                           handleDeleteSingleClass(cls.id);
                         }}
                         className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg transition"
                         title="Xóa lớp học này"
                       >
                         <Lucide.Trash2 className="h-3.5 w-3.5" />
                       </button>
                     </div>
                   </div>
                 ))}
               </div>
            ) : (
              <div className="text-center py-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl space-y-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-full w-max mx-auto">
                  <Lucide.FolderOpen className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-700">Chưa tạo lớp học nào</p>
                  <p className="text-[10px] text-slate-400 leading-normal max-w-[200px] mx-auto">Hãy thiết lập lớp học đầu tiên của bạn dưới đây.</p>
                </div>
                <button
                  onClick={handleLoadDemoClasses}
                  className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 bg-white border border-indigo-200 px-3 py-1 rounded-md shadow-3xs hover:bg-indigo-50/50 transition mt-1"
                >
                  Tải nhanh dữ liệu demo
                </button>
              </div>
            )}
          </div>

          {/* Create classroom form */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-3xs space-y-4">
            <div className="flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <Lucide.PlusCircle className="h-4 w-4 text-emerald-600" />
              <h3 className="text-xs font-bold font-mono tracking-widest text-slate-400 uppercase">
                TẠO LỚP LUYỆN THI MỚI
              </h3>
            </div>
            <form onSubmit={handleCreateClass} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider block">TÊN LỚP ĐÀO TẠO</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Tin Học Văn Phòng 11A"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-indigo-500 hover:border-slate-300"
                  id="teach-new-classname"
                />
              </div>
              <button
                type="submit"
                className="w-full text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition shadow-sm"
              >
                Khởi tạo liên kết lớp mới
              </button>
            </form>
            {inviteCodeCreated && (
              <div className="bg-emerald-50/40 p-3.5 rounded-xl border border-emerald-250 text-center space-y-1.5 animate-fadeIn">
                <span className="text-[10px] font-bold font-mono text-slate-500 block">Mã mời học sinh nhập trên Firebase:</span>
                <span className="text-sm font-bold font-mono text-emerald-700 tracking-wider block bg-white px-3 py-1 rounded-md border border-emerald-200">{inviteCodeCreated}</span>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Class analytics & Student list */}
        <div className="lg:col-span-8 space-y-6">
          {activeClass ? (
            <div className="space-y-6 bg-white border border-slate-200 p-6 rounded-2xl shadow-3xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-mono text-indigo-700 font-bold uppercase bg-indigo-50 px-2.5 py-0.5 border border-indigo-200 rounded-md">
                    BÁO CÁO TOÀN LỚP
                  </span>
                  <h2 className="text-base font-bold text-slate-800 mt-1 flex items-center gap-2">
                    <span>{activeClass.name}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteSingleClass(activeClass.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                      title="Xóa lớp học này"
                    >
                      <Lucide.Trash2 className="h-4 w-4" />
                    </button>
                  </h2>
                </div>
                <div className="flex flex-col sm:items-end">
                  <span className="text-[10px] font-mono text-slate-400 block font-bold">ĐIỂM TRUNG BÌNH CỦA LỚP:</span>
                  <span className="text-base font-extrabold text-emerald-600 font-mono block">
                    {activeClass.averageScore || '0'} / 1000 điểm
                  </span>
                </div>
              </div>

              {/* Add Student block manual trigger */}
              <div className="flex justify-end">
                <button
                  onClick={() => setShowAddStudentForm(!showAddStudentForm)}
                  className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl font-bold hover:bg-emerald-100 transition flex items-center gap-1.5"
                >
                  <Lucide.UserPlus className="h-4 w-4" />
                  {showAddStudentForm ? "Hủy" : "Thêm một học sinh bằng tay"}
                </button>
              </div>

              {/* Add Student manually to class form */}
              {showAddStudentForm && (
                <form onSubmit={handleAddStudent} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4 animate-fadeIn">
                  <h4 className="text-xs font-bold font-mono text-slate-600 uppercase">THÔNG TIN HỌC VIÊN MỚI TRONG LỚP</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase font-mono block">Họ và tên</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Nguyễn Văn An" 
                        value={studName} 
                        onChange={(e) => setStudName(e.target.value)} 
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase font-mono block">Email học viên</label>
                      <input 
                        type="email" 
                        required 
                        placeholder="an.nv@student.com" 
                        value={studEmail} 
                        onChange={(e) => setStudEmail(e.target.value)} 
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase font-mono block">Điểm thi thử hiện tại (0 - 1000)</label>
                      <input 
                        type="number" 
                        required 
                        min="0" 
                        max="1000" 
                        placeholder="750" 
                        value={studScore} 
                        onChange={(e) => setStudScore(Number(e.target.value))} 
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase font-mono block">Số chuyên đề lý thuyết đã học</label>
                      <input 
                        type="number" 
                        required 
                        min="0" 
                        max="15" 
                        placeholder="6" 
                        value={studLessons} 
                        onChange={(e) => setStudLessons(Number(e.target.value))} 
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg transition shadow-sm">
                      Lưu và tính điểm tự động
                    </button>
                  </div>
                </form>
              )}

              {/* Graphical visualizer for scores and pass rate prediction */}
              {activeClass.students.length > 0 ? (
                <div className="space-y-6 animate-fadeIn">
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest">
                      BIỂU ĐỒ PHÂN TÍCH ĐIỂM THI THỦ NỘI BỘ LỚP
                    </h3>
                    <div className="w-full h-48 bg-slate-50/80 p-3 rounded-xl border border-slate-200">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                          <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px' }}
                            labelStyle={{ color: '#000000', fontWeight: 'bold' }}
                          />
                          <Bar dataKey="Điểm Thi Thử" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Student list */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold font-mono text-slate-450 uppercase flex items-center gap-1.5">
                      <Lucide.Users2 className="h-4 w-4 text-slate-500" /> Bảng điểm tiến độ thực tế ({activeClass.students.length} học sinh)
                    </h3>
                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="min-w-full text-xs text-left text-slate-700 font-sans">
                        <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700 uppercase">
                          <tr>
                            <th className="px-4 py-3">Học sinh</th>
                            <th className="px-4 py-3">Email liên lạc</th>
                            <th className="px-4 py-3 text-center">Hoàn thành</th>
                            <th className="px-4 py-3 text-center">Thi thử</th>
                            <th className="px-4 py-3 text-center">Đỗ Dự kiến</th>
                            <th className="px-4 py-3 text-center">Hành vi</th>
                            <th className="px-4 py-3 text-center">Gỡ bỏ</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-150">
                          {activeClass.students.map((stud) => (
                            <tr key={stud.id} className="hover:bg-slate-50/50">
                              <td className="px-4 py-3 font-bold text-slate-800">{stud.name}</td>
                              <td className="px-4 py-3 text-slate-500 font-mono text-[10.5px]">{stud.email}</td>
                              <td className="px-4 py-3 text-center font-mono font-medium text-slate-600">{stud.completedLessons} Chương</td>
                              <td className="px-4 py-3 text-center text-indigo-700 font-extrabold font-mono">{stud.avgExamScore} / 1000</td>
                              <td className="px-4 py-3 text-center text-emerald-600 font-extrabold font-mono">{stud.predictedPassRate}%</td>
                              <td className="px-4 py-3 text-center">
                                <span className={`text-[9px] uppercase px-2.5 py-0.5 font-mono border rounded-full font-bold ${
                                  stud.activityStatus === 'active'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-250'
                                    : stud.activityStatus === 'at_risk'
                                    ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                                    : 'bg-slate-100 text-slate-500 border-slate-200'
                                }`}>
                                  {stud.activityStatus === 'active' ? 'Hoạt động' : stud.activityStatus === 'at_risk' ? 'Cảnh báo' : 'Vắng'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteStudent(stud.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition"
                                  title="Xóa học sinh khỏi lớp"
                                >
                                  <Lucide.Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <Lucide.Inbox className="h-8 w-8 text-slate-400 mx-auto" />
                  <p className="text-xs text-slate-600 font-bold">Lớp mới lập - Chưa có học sinh</p>
                  <p className="text-[10px] text-slate-400 leading-normal max-w-[300px] mx-auto">Vui lòng bấm vào "<strong>Thêm một học sinh bằng tay</strong>" ở trên để ghi chép điểm số tiến học của học sinh trong lớp.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
              <Lucide.GraduationCap className="h-10 w-10 text-indigo-400 mx-auto" />
              <div className="space-y-1">
                <p className="text-slate-700 font-bold text-sm">Chưa chọn lớp học hiển thị</p>
                <p className="text-xs text-slate-400">Vui lòng nhấp vào một lớp cụm ở cột bên trái hoặc tạo lớp mới để theo dõi biểu đồ dự báo thi đỗ!</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reusable Premium Custom Confirmation Dialog Modal for Safe Sandbox Execution */}
      {confirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-4 animate-scaleUp">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 shrink-0 mt-0.5">
                <Lucide.AlertCircle className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 text-sm">Xác nhận thao tác xóa</h4>
                <p className="text-xs text-slate-500 leading-normal font-semibold">
                  {confirmModal.message}
                </p>
                <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider bg-rose-50/50 px-2.5 py-1 rounded border border-rose-100 mt-1.5 inline-block">
                  Hành động này không thể hoàn tác!
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  try {
                    confirmModal.onConfirm();
                  } catch (e) {
                    console.error("Confirmation error:", e);
                  }
                  setConfirmModal(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-rose-600/10"
              >
                Đồng ý xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
