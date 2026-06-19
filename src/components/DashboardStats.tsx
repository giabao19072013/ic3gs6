import React, { useState } from 'react';
import { UserProfile } from '../types';
import * as Lucide from 'lucide-react';

interface DashboardStatsProps {
  user: UserProfile;
  onJoinClass?: (classCode: string) => Promise<{ success: boolean; message: string }>;
}

export default function DashboardStats({ user, onJoinClass }: DashboardStatsProps) {
  const [classCode, setClassCode] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Helper to dynamically render Lucide icons
  const renderIcon = (iconName: string, className = "h-5 w-5") => {
    const IconComponent = (Lucide as any)[iconName];
    if (IconComponent) {
      return <IconComponent className={className} />;
    }
    return <Lucide.Award className={className} />;
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Legendary': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Epic': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Rare': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleJoinClassClick = async () => {
    if (!classCode.trim()) {
      setStatusMessage({ type: 'error', text: 'Vui lòng nhập mã lớp.' });
      return;
    }
    setSubmitting(true);
    setStatusMessage(null);
    try {
      if (onJoinClass) {
        const result = await onJoinClass(classCode);
        if (result.success) {
          setStatusMessage({ type: 'success', text: result.message });
          setClassCode('');
        } else {
          setStatusMessage({ type: 'error', text: result.message });
        }
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Có lỗi xảy ra khi liên kết lớp.' });
    } finally {
      setSubmitting(false);
    }
  };

  const xpPercent = Math.min(100, Math.floor((user.xp % 500) / 5));

  return (
    <div className="space-y-6">
      {/* Level & XP Quick Overview - Elegant Bright Cover Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute -top-10 -right-10 h-40 w-40 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-500 flex items-center justify-center text-white text-xl font-extrabold shadow-md shadow-indigo-600/10">
              Lv.{user.level}
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                Học viên hoạt động: {user.name}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {user.schoolName || 'Hệ thống học viên'} • Lớp học: <span className="text-indigo-600 font-bold">{user.gradeClass || 'Chưa phân lớp'}</span>
              </p>
            </div>
          </div>

          <div className="flex-1 max-w-md w-full">
            <div className="flex justify-between text-xs font-mono text-slate-500 mb-1.5 font-bold">
              <span>Hành trình tới Cấp Lv.{user.level + 1}</span>
              <span className="text-indigo-600">{user.xp % 500} / 500 XP tích lũy</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 via-sky-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${xpPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Class Linkage Panel for Students */}
      {user.role === 'student' && onJoinClass && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
                  <Lucide.Link2 className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-xs font-bold font-mono tracking-wider text-slate-500 uppercase">LIÊN KẾT LỚP HỌC TRỰC TUYẾN</h3>
              </div>
              <p className="text-xs font-medium text-slate-600">
                {user.gradeClass && user.gradeClass !== 'Chưa phân lớp'
                  ? `Bạn đang học lớp: "${user.gradeClass}". Nhập mã mới bên dưới để thay đổi liên kết lớp của bạn.`
                  : 'Nhập mã liên kết lớp được cung cấp bởi Giáo viên để đồng bộ tiến trình học tập lên sổ thống kê lớp.'
                }
              </p>
            </div>

            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
              <input
                id="student-class-code-input"
                type="text"
                placeholder="Ví dụ: IC3-K68-BASIC"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value)}
                className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-extrabold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white uppercase transition"
              />
              <button
                id="student-class-code-btn"
                onClick={handleJoinClassClick}
                disabled={submitting}
                className="px-4.5 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white shadow-3xs hover:bg-indigo-700 active:scale-98 transition flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
              >
                {submitting ? (
                  <Lucide.Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Lucide.Check className="h-3.5 w-3.5" />
                )}
                <span>Kết nối lớp</span>
              </button>
            </div>
          </div>

          {statusMessage && (
            <div className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-semibold ${
              statusMessage.type === 'success' 
                ? 'bg-emerald-50 border-emerald-200/60 text-emerald-800' 
                : 'bg-rose-50 border-rose-200/60 text-rose-800'
            }`}>
              {statusMessage.type === 'success' ? (
                <Lucide.CheckCircle2 className="h-4 w-4.5 text-emerald-600 shrink-0" />
              ) : (
                <Lucide.AlertCircle className="h-4 w-4.5 text-rose-600 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}
        </div>
      )}

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 hover:border-indigo-600/40 transition shadow-2xs">
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Lucide.Clock className="h-6 w-6" />
          </div>
          <div>
            <div className="text-slate-400 text-[10px] font-mono font-bold tracking-wider">TÍCH LŨY THỜI GIAN</div>
            <div className="text-xl font-extrabold text-slate-800 mt-0.5">{user.hoursStudied} giờ</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 hover:border-rose-600/40 transition shadow-2xs">
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
            <Lucide.Flame className="h-6 w-6" fill="currentColor" />
          </div>
          <div>
            <div className="text-slate-400 text-[10px] font-mono font-bold tracking-wider">CHUỖI LIÊN TIẾP</div>
            <div className="text-xl font-extrabold text-slate-800 mt-0.5">{user.streakDays} ngày</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 hover:border-emerald-600/40 transition shadow-2xs">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <Lucide.CheckSquare className="h-6 w-6" />
          </div>
          <div>
            <div className="text-slate-400 text-[10px] font-mono font-bold tracking-wider">HOÀN THÀNH KHOÁ</div>
            <div className="text-xl font-extrabold text-slate-800 mt-0.5">{user.completionRate}%</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 hover:border-amber-600/40 transition shadow-2xs">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
            <Lucide.Sparkles className="h-6 w-6" />
          </div>
          <div>
            <div className="text-slate-400 text-[10px] font-mono font-bold tracking-wider">TỔNG ĐIỂM XP</div>
            <div className="text-xl font-extrabold text-slate-800 mt-0.5">{user.xp} XP</div>
          </div>
        </div>
      </div>

      {/* Achievements & Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Achievements Progress */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-2xs">
          <h3 className="text-xs font-bold text-slate-400 font-mono tracking-widest flex items-center gap-2">
            <Lucide.CalendarDays className="h-4 w-4 text-indigo-600" /> THÀNH TÍCH TIẾN ĐỘ THỰC TẾ
          </h3>
          <div className="space-y-4">
            {user.achievements.map((ach) => {
              const achPercent = Math.min(100, Math.floor((ach.currentValue / ach.targetValue) * 100));
              return (
                <div key={ach.id} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                  <div className="flex justify-between items-center mb-1.5">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-800">{ach.title}</h4>
                      <p className="text-[10px] text-slate-500 font-medium">{ach.description}</p>
                    </div>
                    {achPercent >= 100 ? (
                      <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">Đồng đạt</span>
                    ) : (
                      <span className="text-[10px] text-indigo-600 font-mono font-bold bg-indigo-50 border border-indigo-150 px-2 py-0.5 rounded">{ach.currentValue}/{ach.targetValue}</span>
                    )}
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${achPercent >= 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                      style={{ width: `${achPercent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Unlocked Badges */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-2xs">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-400 font-mono tracking-widest flex items-center gap-2">
              <Lucide.Trophy className="h-4 w-4 text-amber-500" /> BỘ SƯU TẬP HUY HIỆU KHẢO THÍ
            </h3>
            <span className="text-xs text-slate-500 font-mono font-bold bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">{user.badges.filter(b => b.unlockedAt).length} / {user.badges.length} đã mở</span>
          </div>
          <div className="grid grid-cols-1 gap-3.5 max-h-[295px] overflow-y-auto pr-1">
            {user.badges.map((badge) => {
              const isUnlocked = !!badge.unlockedAt;
              return (
                <div 
                  key={badge.id}
                  className={`p-3.5 rounded-xl border flex items-start gap-3 transition ${
                    isUnlocked 
                      ? 'bg-slate-50/50 border-slate-200' 
                      : 'bg-slate-50/30 border-slate-150 opacity-40 grayscale'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl border ${
                    isUnlocked 
                      ? 'bg-white border-slate-200 text-indigo-600 shadow-3xs' 
                      : 'bg-slate-100 border-slate-200 text-slate-400'
                  } flex-shrink-0`}>
                    {renderIcon(badge.icon, "h-5 w-5")}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-xs font-bold text-slate-800">{badge.title}</h4>
                      <span className={`text-[8px] uppercase tracking-widest font-mono border px-1.5 py-0.5 rounded font-bold ${getRarityColor(badge.rarity)}`}>
                        {badge.rarity}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium leading-normal">{badge.description}</p>
                    {isUnlocked && (
                      <span className="text-[9px] text-emerald-600 font-mono block font-bold">✓ Mở khóa ngày: {badge.unlockedAt}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
