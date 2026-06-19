import React, { useState, useEffect } from 'react';
import { MOCK_USER, IC3_COURSES } from './lmsData';
import { UserProfile, CourseModule, Badge } from './types';
import DashboardStats from './components/DashboardStats';
import CourseExplorer from './components/CourseExplorer';
import ExamSimulator from './components/ExamSimulator';
import TeacherDashboard from './components/TeacherDashboard';
import DocExplorer from './components/DocExplorer';
import AuthScreen from './components/AuthScreen';
import AccountManager from './components/AccountManager';
import { auth, getUserProfile, saveUserProfile, UserProfileData } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import * as Lucide from 'lucide-react';

export default function App() {
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [courses, setCourses] = useState<CourseModule[]>(IC3_COURSES);
  const [activeTab, setActiveTab] = useState<'home' | 'courses' | 'exams' | 'teacher' | 'docs' | 'admin'>('home');

  // Monitor Authentication state
  useEffect(() => {
    // Check if we have a local fallback session first
    const checkLocalSession = () => {
      const savedUid = localStorage.getItem('local_user_session_id');
      const savedProfile = localStorage.getItem('local_user_session_profile');
      if (savedUid && savedProfile) {
        try {
          const profile = JSON.parse(savedProfile);
          setUserProfile(profile);
          setFirebaseUser({ uid: savedUid, email: profile.email, displayName: profile.name });
          
          // Map completed lessons
          const syncedCourses = IC3_COURSES.map((course) => {
            const updatedLessons = course.lessons.map((lesson) => ({
              ...lesson,
              isCompleted: profile.completedLessons?.includes(lesson.id) || false
            }));
            const completedCount = updatedLessons.filter(l => l.isCompleted).length;
            const progressPercent = Math.min(100, Math.floor((completedCount / updatedLessons.length) * 100));
            return {
              ...course,
              lessons: updatedLessons,
              progress: progressPercent
            };
          });
          setCourses(syncedCourses);
          setAuthLoading(false);
          return true;
        } catch (e) {
          console.error("Local session restore error", e);
        }
      }
      return false;
    };

    const hasLocal = checkLocalSession();

    const unsubscribe = onAuthStateChanged(auth, async (currentFirebaseUser) => {
      const authMethod = localStorage.getItem('local_user_session_method');
      if (authMethod === 'db') {
        setAuthLoading(false);
        return;
      }

      setAuthLoading(true);
      try {
        if (currentFirebaseUser) {
          setFirebaseUser(currentFirebaseUser);
          // Load user profile from Firestore
          const profile = await getUserProfile(currentFirebaseUser.uid);
          if (profile) {
            setUserProfile(profile);
            localStorage.setItem('local_user_session_method', 'firebase');
            
            // Map their completed lessons on the courses
            const syncedCourses = IC3_COURSES.map((course) => {
              const updatedLessons = course.lessons.map((lesson) => ({
                ...lesson,
                isCompleted: profile.completedLessons?.includes(lesson.id) || false
              }));
              const completedCount = updatedLessons.filter(l => l.isCompleted).length;
              const progressPercent = Math.min(100, Math.floor((completedCount / updatedLessons.length) * 100));
              return {
                ...course,
                lessons: updatedLessons,
                progress: progressPercent
              };
            });
            setCourses(syncedCourses);
          }
        } else {
          // If we have a local session marked as 'db', keep it. Otherwise, clear.
          if (authMethod !== 'db') {
            setFirebaseUser(null);
            setUserProfile(null);
            localStorage.removeItem('local_user_session_method');
          }
        }
      } catch (err) {
        console.error("onAuthStateChanged profile loading error:", err);
      } finally {
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync userProfile changes to localStorage for offline robustness/fallback persistency
  useEffect(() => {
    if (userProfile) {
      localStorage.setItem('local_user_session_id', userProfile.id);
      localStorage.setItem('local_user_session_profile', JSON.stringify(userProfile));
    }
  }, [userProfile]);

  const handleLogout = async () => {
    try {
      localStorage.removeItem('local_user_session_id');
      localStorage.removeItem('local_user_session_profile');
      await signOut(auth);
      setFirebaseUser(null);
      setUserProfile(null);
      setActiveTab('home');
    } catch (e) {
      console.error("Logout fail:", e);
    }
  };

  // Convert Firebase user data to legacy UserProfile model for child compatibility
  const getLegacyUserProfile = (): UserProfile => {
    if (!userProfile) return MOCK_USER;

    // Map their unlocked badges status
    const allBadges: Badge[] = MOCK_USER.badges.map((b) => ({
      ...b,
      unlockedAt: userProfile.unlockedBadgeIds?.includes(b.id) 
        ? (new Date().toISOString().split('T')[0]) 
        : b.unlockedAt // fallback to mock unlocked dates if pre-saved
    }));

    return {
      id: userProfile.id,
      name: userProfile.name,
      email: userProfile.email,
      avatar: userProfile.avatar || MOCK_USER.avatar,
      role: userProfile.role,
      birthDate: userProfile.birthDate || '2005-08-15',
      schoolName: userProfile.schoolName || 'Học viện Công nghệ',
      gradeClass: userProfile.gradeClass || 'Chưa phân lớp',
      country: userProfile.country || 'Vietnam',
      xp: userProfile.xp,
      level: userProfile.level,
      streakDays: userProfile.streakDays,
      hoursStudied: userProfile.hoursStudied,
      completionRate: userProfile.completionRate,
      badges: allBadges,
      achievements: MOCK_USER.achievements
    };
  };

  // Triggered when completing elements inside the courses explorer
  const handleCompleteLessonByStudent = async (moduleId: string, lessonId: string, xpReward: number) => {
    if (!userProfile) return;

    // 1. Update courses local state
    const updatedCourses = courses.map((course) => {
      if (course.id !== moduleId) return course;
      const updatedLessons = course.lessons.map((lesson) => {
        if (lesson.id === lessonId) {
          return { ...lesson, isCompleted: true };
        }
        return lesson;
      });
      const completedCount = updatedLessons.filter(l => l.isCompleted).length;
      const progressPercent = Math.min(100, Math.floor((completedCount / updatedLessons.length) * 100));
      return { 
        ...course, 
        lessons: updatedLessons,
        progress: progressPercent
      };
    });

    setCourses(updatedCourses);

    // 2. Increment student metrics (XP, level) and save to Firebase Firestore
    const newXP = userProfile.xp + xpReward;
    const newLevel = Math.floor(newXP / 500) + 1; // 500 XP per level
    const completedAllLessonsCount = updatedCourses.flatMap(c => c.lessons).filter(l => l.isCompleted).length;
    const totalAllLessonsCount = updatedCourses.flatMap(c => c.lessons).length;
    const newCompletionRate = Math.floor((completedAllLessonsCount / totalAllLessonsCount) * 100);

    const updatedCompletedLessons = userProfile.completedLessons 
      ? [...userProfile.completedLessons] 
      : [];
    
    if (!updatedCompletedLessons.includes(lessonId)) {
      updatedCompletedLessons.push(lessonId);
    }

    const updatedProfile: Partial<UserProfileData> = {
      xp: newXP,
      level: newLevel,
      completionRate: newCompletionRate,
      completedLessons: updatedCompletedLessons,
      hoursStudied: Math.round((userProfile.hoursStudied + 0.5) * 10) / 10 // increment study duration slightly
    };

    setUserProfile({
      ...userProfile,
      ...updatedProfile,
      completedLessons: updatedCompletedLessons
    });

    // Write to Firebase Firestore
    await saveUserProfile(userProfile.id, updatedProfile);
  };

  const handleUnlockBadgeEarned = async (badgeId: string) => {
    if (!userProfile) return;
    const curBadges = userProfile.unlockedBadgeIds || [];
    if (curBadges.includes(badgeId)) return;

    const updatedBadges = [...curBadges, badgeId];
    setUserProfile({
      ...userProfile,
      unlockedBadgeIds: updatedBadges
    });

    await saveUserProfile(userProfile.id, {
      unlockedBadgeIds: updatedBadges
    });
  };

  const handleGainXPReward = async (xpAmount: number) => {
    if (!userProfile) return;
    const updatedXP = userProfile.xp + xpAmount;
    const updatedLevel = Math.floor(updatedXP / 500) + 1;

    setUserProfile({
      ...userProfile,
      xp: updatedXP,
      level: updatedLevel
    });

    await saveUserProfile(userProfile.id, {
      xp: updatedXP,
      level: updatedLevel
    });
  };

  const handleUpdateProfileDetails = async (name: string, school: string, grade: string) => {
    if (!userProfile) return;
    const update = {
      name: name,
      schoolName: school,
      gradeClass: grade
    };
    setUserProfile({
      ...userProfile,
      ...update
    });
    await saveUserProfile(userProfile.id, update);
  };

  const handleJoinClassByCode = async (classCode: string): Promise<{ success: boolean; message: string }> => {
    if (!userProfile) return { success: false, message: 'Người dùng chưa đăng nhập.' };
    const code = classCode.trim().toUpperCase();
    if (!code) return { success: false, message: 'Vui lòng nhập mã lớp.' };

    try {
      // 1. Search shared classes first, then all ic3_classes_ local keys
      const sharedClassesRaw = localStorage.getItem('ic3_classes_shared') || '[]';
      const sharedClasses = JSON.parse(sharedClassesRaw);
      
      let matchedClass = sharedClasses.find((c: any) => c.code.toUpperCase() === code);
      
      if (!matchedClass) {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('ic3_classes_') && key !== 'ic3_classes_shared') {
            const classesRaw = localStorage.getItem(key);
            if (classesRaw) {
              try {
                const classesList = JSON.parse(classesRaw);
                const found = classesList.find((c: any) => c.code.toUpperCase() === code);
                if (found) {
                  matchedClass = { id: found.id, name: found.name, code: found.code, teacherId: found.teacherId };
                  break;
                }
              } catch (parseErr) {}
            }
          }
        }
      }

      // Fallback for default mock classroom codes if needed
      if (!matchedClass) {
        if (code === 'IC3-K68-BASIC') {
          matchedClass = { id: 'cls_01', name: 'Lớp Luyện thi IC3 - Khóa Cơ bản K68', code: 'IC3-K68-BASIC', teacherId: 'usr_teacher_01' };
        } else if (code === 'THDC-G5') {
          matchedClass = { id: 'cls_02', name: 'Tin học Đại cương - Nhóm 5', code: 'THDC-G5', teacherId: 'usr_teacher_01' };
        }
      }

      if (!matchedClass) {
        return { success: false, message: `Mã liên kết "${code}" không hợp lệ hoặc lớp học không tồn tại.` };
      }

      // 2. Enroll student into teacher's actual roster in localStorage
      const teacherClassesKey = `ic3_classes_${matchedClass.teacherId}`;
      const classesRaw = localStorage.getItem(teacherClassesKey) || '[]';
      let classesList = [];
      try {
        classesList = JSON.parse(classesRaw);
      } catch (e) {}

      let foundClassInTeacherList = classesList.find((c: any) => c.id === matchedClass.id);
      if (!foundClassInTeacherList) {
        foundClassInTeacherList = {
          id: matchedClass.id,
          name: matchedClass.name,
          code: matchedClass.code,
          teacherId: matchedClass.teacherId,
          studentCount: 0,
          averageScore: 0,
          students: [],
          assignments: []
        };
        classesList.push(foundClassInTeacherList);
      }

      if (!foundClassInTeacherList.students) {
        foundClassInTeacherList.students = [];
      }

      const isAlreadyInRoster = foundClassInTeacherList.students.some((s: any) => s.email.toLowerCase() === userProfile.email.toLowerCase());
      if (!isAlreadyInRoster) {
        foundClassInTeacherList.students.push({
          id: userProfile.id,
          name: userProfile.name,
          email: userProfile.email.toLowerCase(),
          completedLessons: userProfile.completedLessons?.length || 0,
          avgExamScore: 0,
          predictedPassRate: 0,
          streakDays: userProfile.streakDays || 0,
          activityStatus: 'active'
        });
        foundClassInTeacherList.studentCount = foundClassInTeacherList.students.length;
        localStorage.setItem(teacherClassesKey, JSON.stringify(classesList));
      }

      // Ensure class exists in shared lists
      try {
        const currentShared = JSON.parse(localStorage.getItem('ic3_classes_shared') || '[]');
        if (!currentShared.some((s: any) => s.id === matchedClass.id)) {
          currentShared.push(matchedClass);
          localStorage.setItem('ic3_classes_shared', JSON.stringify(currentShared));
        }
      } catch (err) {}

      // 3. Update student profile locally and in Firestore
      const updateData = {
        gradeClass: matchedClass.name
      };
      
      setUserProfile((prevProfile) => {
        if (!prevProfile) return null;
        return {
          ...prevProfile,
          ...updateData
        };
      });

      await saveUserProfile(userProfile.id, updateData);

      return { success: true, message: `Bạn đã tham gia lớp học "${matchedClass.name}" thành công!` };
    } catch (e: any) {
      console.error(e);
      return { success: false, message: `Lỗi hệ thống: ${e.message || e}` };
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <Lucide.Loader2 className="h-10 w-10 animate-spin text-indigo-600 mx-auto" />
          <div>
            <h2 className="text-base font-extrabold text-slate-800 tracking-tight">IC3 Cloud Service Syncing</h2>
            <p className="text-xs text-slate-500 font-medium mt-1">Đang kết nối cơ sở dữ liệu Firebase Cloud...</p>
          </div>
        </div>
      </div>
    );
  }

  // Render Authentication selection panel if user hasn't authenticated
  if (!firebaseUser || !userProfile) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <header className="px-6 py-4 border-b border-slate-200/80 bg-white shadow-3xs flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white"><Lucide.GraduationCap className="h-4.5 w-4.5" /></div>
          <span className="text-sm font-extrabold text-slate-900 tracking-tight">IC3 GS6 Cloud Center (LMS)</span>
        </header>
        <AuthScreen onAuthSuccess={(profile) => {
          setUserProfile(profile);
          const currentUser = auth.currentUser;
          if (currentUser) {
            localStorage.setItem('local_user_session_method', 'firebase');
            setFirebaseUser(currentUser);
          } else {
            localStorage.setItem('local_user_session_method', 'db');
            setFirebaseUser({ uid: profile.id, email: profile.email, displayName: profile.name });
          }
        }} />
        <footer className="py-3 px-6 text-center border-t border-slate-200 bg-white text-[10px] text-slate-400 font-mono">
          <span>Học viện Đào tạo Quốc tế IC3 Cloud Hub © 2026. All security configurations verified.</span>
        </footer>
      </div>
    );
  }

  const legacyUser = getLegacyUserProfile();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans select-none antialiased">
      {/* Top brand header bar in light mode */}
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-30 px-6 py-3.5 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-3xs">
        {/* Brand logo */}
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white font-bold shadow-sm shadow-indigo-600/20">
            <Lucide.GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <span>IC3 GS6 Cloud Center</span>
            </h1>
            <p className="text-[9.5px] text-slate-400 font-mono tracking-widest font-bold uppercase">
              HỆ THỐNG QUẢN TRỊ HỌC TẬP THỰC TẾ
            </p>
          </div>
        </div>

        {/* Current user status & Logout */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-3.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <div className="text-left">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
                Tài khoản: {(legacyUser.email.toLowerCase() === 'nguyenbao22013@gmail.com' || legacyUser.email.toLowerCase() === 'nguyenbao42013@gmail.com') ? 'Admin & Giáo viên' : legacyUser.role === 'student' ? 'Học viên' : legacyUser.role === 'teacher' ? 'Giáo viên' : 'Admin'}
              </span>
              <span className="text-xs font-bold text-slate-800 block leading-tight">{legacyUser.name}</span>
            </div>
            
            {/* Quick edit dialog button or trigger info */}
            <div className="h-5 w-[1px] bg-slate-300"></div>
            
            <button
              onClick={handleLogout}
              className="text-[10px] font-bold text-slate-500 hover:text-rose-600 flex items-center gap-1 bg-white hover:bg-rose-50 border border-slate-250 hover:border-rose-200 px-2.5 py-1 rounded-lg transition"
              id="header-logout-btn"
            >
              <Lucide.LogOut className="h-3 w-3" />
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col md:flex-row items-stretch">
        
        {/* Side panel router */}
        <aside className="w-full md:w-64 border-r border-slate-200/80 bg-white p-5 flex flex-col justify-between gap-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-bold font-mono tracking-widest text-slate-400 uppercase block pl-2">LỚP HỌC CHUYÊN ĐỀ</span>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab('home')}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition duration-150 ${
                    activeTab === 'home' 
                      ? 'bg-indigo-50/80 text-indigo-700 shadow-3xs border border-indigo-100' 
                      : 'text-slate-600 hover:bg-slate-50/50 hover:text-slate-900 border border-transparent'
                  }`}
                >
                  <Lucide.Home className={`h-4.5 w-4.5 ${activeTab === 'home' ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>Tổng quan cá nhân</span>
                </button>

                <button
                  onClick={() => setActiveTab('courses')}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition duration-150 ${
                    activeTab === 'courses' 
                      ? 'bg-indigo-50/80 text-indigo-700 shadow-3xs border border-indigo-100' 
                      : 'text-slate-600 hover:bg-slate-50/50 hover:text-slate-900 border border-transparent'
                  }`}
                >
                  <Lucide.BookOpen className={`h-4.5 w-4.5 ${activeTab === 'courses' ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>Lộ trình Học nâng cao</span>
                </button>

                <button
                  onClick={() => setActiveTab('exams')}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition duration-150 ${
                    activeTab === 'exams' 
                      ? 'bg-indigo-50/80 text-indigo-700 shadow-3xs border border-indigo-100' 
                      : 'text-slate-600 hover:bg-slate-50/50 hover:text-slate-900 border border-transparent'
                  }`}
                >
                  <Lucide.Trophy className={`h-4.5 w-4.5 ${activeTab === 'exams' ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>Thi thử Certiport</span>
                </button>
              </div>
            </div>

            {/* Teacher tab - viewable by teachers or school admins */}
            {(userProfile?.role === 'teacher' || userProfile?.role === 'school_admin' || userProfile?.email?.toLowerCase() === 'nguyenbao22013@gmail.com' || userProfile?.email?.toLowerCase() === 'nguyenbao42013@gmail.com') && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold font-mono tracking-widest text-slate-400 uppercase block pl-2">PHÂN HỆ NGƯỜI DẠY</span>
                <div className="space-y-1">
                  <button
                    onClick={() => setActiveTab('teacher')}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition duration-150 ${
                      activeTab === 'teacher' 
                        ? 'bg-indigo-50/80 text-indigo-700 shadow-3xs border border-indigo-100' 
                        : 'text-slate-600 hover:bg-slate-50/50 hover:text-slate-900 border border-transparent'
                    }`}
                  >
                    <Lucide.Users2 className={`h-4.5 w-4.5 ${activeTab === 'teacher' ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span>Quản lý Lớp & AI dự báo</span>
                  </button>
                </div>
              </div>
            )}

            {/* Admin account manager tab - viewable by school admins */}
            {(userProfile?.role === 'school_admin' || userProfile?.email?.toLowerCase() === 'nguyenbao22013@gmail.com' || userProfile?.email?.toLowerCase() === 'nguyenbao42013@gmail.com') && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold font-mono tracking-widest text-slate-400 uppercase block pl-2">QUẢN TRỊ HỆ THỐNG</span>
                <div className="space-y-1">
                  <button
                    onClick={() => setActiveTab('admin')}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition duration-150 ${
                      activeTab === 'admin' 
                        ? 'bg-indigo-50/80 text-indigo-700 shadow-3xs border border-indigo-100' 
                        : 'text-slate-600 hover:bg-slate-50/50 hover:text-slate-900 border border-transparent'
                    }`}
                  >
                    <Lucide.ShieldCheck className={`h-4.5 w-4.5 ${activeTab === 'admin' ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span>Quản lý Tài khoản</span>
                  </button>
                </div>
              </div>
            )}

            {/* Quick settings profile editor */}
            {(userProfile?.role === 'school_admin' || userProfile?.email?.toLowerCase() === 'nguyenbao22013@gmail.com' || userProfile?.email?.toLowerCase() === 'nguyenbao42013@gmail.com') ? (
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-2.5">
                <span className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-widest block">
                  Cập nhật thông tin thật (Admin)
                </span>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Sửa tên của bạn"
                    value={userProfile.name}
                    onChange={(e) => handleUpdateProfileDetails(e.target.value, userProfile.schoolName || '', userProfile.gradeClass || '')}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10.5px] font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    placeholder="Sửa trường học"
                    value={userProfile.schoolName || ''}
                    onChange={(e) => handleUpdateProfileDetails(userProfile.name, e.target.value, userProfile.gradeClass || '')}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10.5px] font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-[10.5px] text-slate-500 space-y-1 block">
                <span className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-widest block mb-1">Hồ Sơ Học Viên</span>
                <p>Họ tên: <strong className="text-slate-700">{userProfile?.name}</strong></p>
                <p>Trường: <strong className="text-slate-700">{userProfile?.schoolName || 'Chưa cập nhật'}</strong></p>
                <div className="text-[9px] text-slate-400 italic pt-1 font-mono leading-tight border-t border-slate-200/60 mt-1">
                  * Học viên không có quyền tự thay đổi học quy và thông tin cá nhân.
                </div>
              </div>
            )}

          </div>

          {/* Quick legal/developer info footer */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-[10px] leading-normal text-slate-500 font-mono space-y-1 block max-w-sm">
            <div className="flex items-center gap-1 font-bold text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Dữ liệu: Firebase Sync Active</span>
            </div>
            <div className="flex items-center gap-1 font-semibold text-indigo-600">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
              <span>Port 3000 Security Core</span>
            </div>
          </div>
        </aside>

        {/* Workspace views selector */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6 max-w-6xl mx-auto w-full">
          {activeTab === 'home' && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-3 flex justify-between items-end">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight uppercase">MÁY TRẠM CÁ NHÂN</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Tiến trình học tập, huy hiệu và bảng thành tích thực tế bảo lưu trên Cloud.</p>
                </div>
                <span className="text-[10px] bg-indigo-50 border border-indigo-200 text-indigo-700 px-2.5 py-1 rounded-md font-mono font-bold uppercase shrink-0">
                  ⚡ Online Db
                </span>
              </div>
              <DashboardStats user={legacyUser} onJoinClass={handleJoinClassByCode} />
            </div>
          )}

          {activeTab === 'courses' && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight uppercase">LỘ TRÌNH ĐÀO TẠO CHUẨN GS6</h2>
                <p className="text-xs text-slate-500 mt-0.5">Độc quyền: Học kỹ lý thuyết chuẩn qua sách giáo khoa số tích hợp rồi làm bài tập ghi nhận tiến trình.</p>
              </div>
              <CourseExplorer courses={courses} onCompleteLesson={handleCompleteLessonByStudent} />
            </div>
          )}

          {activeTab === 'exams' && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight uppercase">ĐẤU TRƯỜNG THI THỬ CERTIPORT</h2>
                <p className="text-xs text-slate-500 mt-0.5">Giao diện giả lập thi chuẩn với hệ thống chấm đề, cảnh báo gian lận và AI Tutor giải nghĩa.</p>
              </div>
              <ExamSimulator 
                user={legacyUser} 
                onUnlockBadge={handleUnlockBadgeEarned} 
                onGainXP={handleGainXPReward} 
              />
            </div>
          )}

          {activeTab === 'teacher' && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight uppercase">KHU VỰC GIẢNG VIÊN & AI ANALYTICS</h2>
                <p className="text-xs text-slate-500 mt-0.5">Thống kê điểm số tiến độ của danh học viên thật lớp học, dự đoán tỷ lệ thi đỗ Certiport.</p>
              </div>
              <TeacherDashboard user={legacyUser} />
            </div>
          )}

          {activeTab === 'docs' && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight uppercase">TÀI LIỆU QUY HOẠCH KỸ THUẬT</h2>
                <p className="text-xs text-slate-500 mt-0.5">Hồ sơ thiết kế Vision, SRS, ERD 50+ tables phân cực, REST APIs Sandbox, Testing và Deployment plans.</p>
              </div>
              <DocExplorer />
            </div>
          )}

          {activeTab === 'admin' && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight uppercase">QUẢN TRỊ TÀI KHOẢN HỆ THỐNG</h2>
                <p className="text-xs text-slate-500 mt-0.5">Cấp phát tài khoản mới không qua đăng ký tự do, lưu trữ thời gian thực trên Firebase Firestore.</p>
              </div>
              <AccountManager />
            </div>
          )}
        </main>
      </div>

      {/* Corporate footer */}
      <footer className="border-t border-slate-200 py-3.5 px-6 bg-white text-center text-[10px] text-slate-400 font-mono">
        <span>© 2026 IC3 GS6 LMS Enterprise Cloud Ecosystem. All specifications cleared to production.</span>
      </footer>
    </div>
  );
}
