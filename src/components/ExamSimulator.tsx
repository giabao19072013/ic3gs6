import React, { useState, useEffect } from 'react';
import { ExamQuestion, UserProfile } from '../types';
import { MOCK_EXAM_QUESTIONS } from '../lmsData';
import * as Lucide from 'lucide-react';

interface ExamSimulatorProps {
  user: UserProfile;
  onUnlockBadge: (badgeId: string) => void;
  onGainXP: (amount: number) => void;
}

export default function ExamSimulator({ user, onUnlockBadge, onGainXP }: ExamSimulatorProps) {
  const [questions, setQuestions] = useState<ExamQuestion[]>(MOCK_EXAM_QUESTIONS);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, any>>({});
  const [examStatus, setExamStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const [timeLeft, setTimeLeft] = useState<number>(2700); // 45 minutes
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  
  // Anti-cheat detection simulation
  const [cheatViolations, setCheatViolations] = useState<number>(0);
  const [cheatAlert, setCheatAlert] = useState<string>('');

  // AI Integration states
  const [aiTutorResponse, setAiTutorResponse] = useState<string>('');
  const [loadingAiTutor, setLoadingAiTutor] = useState<boolean>(false);
  const [aiAnalyticsResponse, setAiAnalyticsResponse] = useState<any>(null);
  const [loadingAiAnalytics, setLoadingAiAnalytics] = useState<boolean>(false);

  // Time tracker
  useEffect(() => {
    let timerID: any;
    if (examStatus === 'running' && timeLeft > 0) {
      timerID = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && examStatus === 'running') {
      submitExam();
    }
    return () => clearInterval(timerID);
  }, [examStatus, timeLeft]);

  // Simulate tab focus out/anti-cheat trigger
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && examStatus === 'running') {
        setCheatViolations((prev) => {
          const updated = prev + 1;
          setCheatAlert(`[CẢNH BÁO QUY CHẾ] Bạn đã chuyển Tab lần thứ ${updated}. Hệ thống Certiport phát hiện và ghi lại nhật ký gian lận!`);
          if (updated >= 3) {
            submitExam();
          }
          return updated;
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [examStatus]);

  const activeQuestion = questions[currentIdx];

  const startExam = () => {
    // Shuffle questions slightly for realistic randomisation
    const shuffled = [...MOCK_EXAM_QUESTIONS].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    setCurrentIdx(0);
    setSelectedAnswers({});
    setExamStatus('running');
    setTimeLeft(2700); // 45m
    setCheatViolations(0);
    setCheatAlert('');
    setAiTutorResponse('');
    setAiAnalyticsResponse(null);
  };

  const handleSelectOption = (questionId: string, answer: any) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answer
    });
  };

  const handleMultipleResponseToggle = (questionId: string, option: string) => {
    const currentList = selectedAnswers[questionId] as string[] || [];
    let newList: string[];
    if (currentList.includes(option)) {
      newList = currentList.filter(item => item !== option);
    } else {
      newList = [...currentList, option];
    }
    handleSelectOption(questionId, newList);
  };

  const handleMatchingSelect = (questionId: string, leftKey: string, rightVal: string) => {
    const currentMap = selectedAnswers[questionId] as Record<string, string> || {};
    const updatedMap = {
      ...currentMap,
      [leftKey]: rightVal
    };
    handleSelectOption(questionId, updatedMap);
  };

  const handleHotspotClick = (questionId: string, hotspotId: string) => {
    handleSelectOption(questionId, hotspotId);
  };

  const handleOrderingShift = (questionId: string, idx: number, direction: 'up' | 'down') => {
    const currentList = selectedAnswers[questionId] as string[] || [...(activeQuestion.options || [])];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= currentList.length) return;

    const swapped = [...currentList];
    const temp = swapped[idx];
    swapped[idx] = swapped[targetIdx];
    swapped[targetIdx] = temp;

    handleSelectOption(questionId, swapped);
  };

  // Grade local questions on submission
  const calculateFinalResults = () => {
    let correctCount = 0;

    questions.forEach((q) => {
      const userAnswer = selectedAnswers[q.id];
      const correctVal = q.correctAnswer;

      if (!userAnswer) return;

      if (q.type === 'MULTIPLE_CHOICE' || q.type === 'TRUE_FALSE' || q.type === 'FILL_BLANK' || q.type === 'HOTSPOT') {
        const cleanedUser = String(userAnswer).trim().toLowerCase();
        const cleanedCorrect = String(correctVal).trim().toLowerCase();
        if (cleanedUser === cleanedCorrect || cleanedCorrect.includes(cleanedUser)) {
          correctCount++;
        }
      } else if (q.type === 'MULTIPLE_RESPONSE' || q.type === 'ORDERING') {
        const userArr = userAnswer as string[];
        const correctArr = correctVal as string[];
        const isMatch = userArr.length === correctArr.length && userArr.every((v, i) => v.toLowerCase() === correctArr[i].toLowerCase());
        if (isMatch) {
          correctCount++;
        }
      } else if (q.type === 'MATCHING') {
        const userMap = userAnswer as Record<string, string>;
        const correctMap = correctVal as Record<string, string>;
        let allCorrect = true;
        Object.keys(correctMap).forEach((k) => {
          if (userMap[k] !== correctMap[k]) allCorrect = false;
        });
        if (allCorrect) {
          correctCount++;
        }
      }
    });

    const finalPercent = correctCount / questions.length;
    // Scale score from 100 to 1000 points (Certiport model), but return 0 if no correct answers
    const finalScore = correctCount === 0 ? 0 : Math.round(100 + finalPercent * 900);

    return { finalScore, correctCount };
  };

  const submitExam = () => {
    const { finalScore } = calculateFinalResults();
    setExamStatus('completed');

    // Give rewards
    onGainXP(150); // reward XP for finishing exam
    if (finalScore >= 700) {
      onUnlockBadge('badge_gs6_cert'); // Unlock Certified Badge
      onGainXP(200); // bonus XP
    }
    if (cheatViolations === 0) {
      onUnlockBadge('badge_consistent'); // Honesty Badge
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  // Mock server-side API AI tutors using detailed pre-mapped explanations
  const askAiTutorExplanation = () => {
    setLoadingAiTutor(true);
    setAiTutorResponse('');
    
    setTimeout(() => {
      const explainText = activeQuestion.explanation || "Để tối ưu hoá câu này, bạn hãy theo sát các bước chỉ định tại thanh công cụ dải Ribbon.";
      setAiTutorResponse(`
### PHÂN TÍCH AI CHUYÊN SÂU
* **Đối tượng kiểm soát**: Mục kiến thức ${activeQuestion.topic || "Tin Học GS6"}.
* **Bản chất vấn đề**: Câu hỏi yêu cầu bạn rèn luyện phản xạ chính xác theo hướng dẫn thao tác cơ bản.
* **Mẹo vượt ải Certiport**: ${explainText}
      `);
      setLoadingAiTutor(false);
    }, 900);
  };

  const askAiAnalyticsOverview = () => {
    setLoadingAiAnalytics(true);
    
    setTimeout(() => {
      const { finalScore } = calculateFinalResults();
      const pct = Math.round((finalScore - 100) / 9);
      
      setAiAnalyticsResponse({
        predictedPassRate: Math.max(35, Math.min(99, pct + 10)),
        weaknesses: [
          "Quản trị dải Ribbon / Định dạng Tabs nâng cao trong Microsoft Office và Word.",
          "Cấu hình các tham số bảo mật trình duyệt, quản lý Cookies và tệp tạm thời.",
          "Sử dụng hàm logic tham chiếu dòng F4 - VLOOKUP trong Microsoft Excel."
        ],
        roadmap: [
          { phase: "Chặng Củng Cố", actions: "Hoàn thiện lại lý thuyết của các bài ôn luyện thuộc Module Cộng tác số." },
          { phase: "Chặng Đột Phá", actions: "Vượt qua bài thi thử GS6 tiếp theo với mục tiêu tối thiểu đạt 850 điểm trở lên." }
        ]
      });
      setLoadingAiAnalytics(false);
    }, 1100);
  };

  return (
    <div className="space-y-6">
      {/* 1. START / IDLE SCREEN - Bright Vibe */}
      {examStatus === 'idle' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-3xs max-w-2xl mx-auto space-y-6 text-center">
          <div className="h-16 w-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
            <Lucide.ShieldCheck className="h-8 w-8 text-indigo-600" />
          </div>
          <div className="space-y-2">
            <span className="text-[10px] font-bold font-mono tracking-widest text-indigo-700 uppercase bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
              GIẢ LẬP KHẢO THÍ CHUẨN CERTIPORT
            </span>
            <h3 className="text-lg font-extrabold text-slate-800 pt-1">Đề Thi Thử IC3 GS6 Tổng Hợp</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Bài thi tổng hợp gồm **15 câu hỏi bám sát sơ đồ cấu trúc Certiport GS6**. Đầy đủ các định dạng câu hỏi tương tác như Hotspot, Matching, Ordering và Multiple Response.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-150 max-w-md mx-auto text-left text-xs text-slate-600 font-semibold">
            <div className="flex items-center gap-2">
              <Lucide.Clock className="h-4.5 w-4.5 text-indigo-500" />
              <span>Thời gian: **45 phút**</span>
            </div>
            <div className="flex items-center gap-2">
              <Lucide.CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
              <span>Điểm đỗ: **700 / 1000**</span>
            </div>
            <div className="flex items-center gap-2">
              <Lucide.Lock className="h-4.5 w-4.5 text-rose-500" />
              <span>Cảnh báo Tab-Cheat</span>
            </div>
            <div className="flex items-center gap-2">
              <Lucide.Cpu className="h-4.5 w-4.5 text-amber-500 animate-pulse" />
              <span>AI chấm điểm thời gian thực</span>
            </div>
          </div>

          <button
            onClick={startExam}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-sm hover:shadow-md transition duration-150 block mx-auto"
            id="start-exam-button"
          >
            Bắt đầu bấm giờ làm bài
          </button>
        </div>
      )}

      {/* 2. EXAM RUNNING VIEW */}
      {examStatus === 'running' && activeQuestion && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main question box */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-3xs space-y-6">
            
            {/* Header info in exam */}
            <div className="flex justify-between items-center bg-slate-50 border border-slate-205 p-3.5 rounded-xl text-xs font-mono font-bold text-slate-600">
              <span className="text-[11px] text-slate-500 font-bold">CÂU HỎI THI: {currentIdx + 1} / {questions.length}</span>
              <div className="flex items-center gap-1.5 text-rose-600">
                <Lucide.Timer className="h-4 w-4 animate-pulse" />
                <span className="font-extrabold text-sm">{formatTime(timeLeft)}</span>
              </div>
            </div>

            {/* Anti cheat violation warning if active */}
            {cheatAlert && (
              <div className="p-3 bg-rose-50 border border-rose-250 text-rose-700 text-[10.5px] font-bold rounded-xl animate-bounce flex items-start gap-2">
                <Lucide.AlertTriangle className="h-4.5 w-4.5 shrink-0 text-rose-500" />
                <p>{cheatAlert}</p>
              </div>
            )}

            {/* Question core */}
            <div className="space-y-4">
              <span className="text-[9px] font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-md uppercase">
                Định dạng: {activeQuestion.type.replace('_', ' ')}
              </span>
              <h3 className="text-sm font-extrabold text-slate-800 leading-relaxed">
                {activeQuestion.questionText}
              </h3>
            </div>

            {/* Choice panels per question type */}
            <div className="border border-slate-100 p-4.5 rounded-xl bg-slate-50/50">
              
              {/* Type 1: MULTIPLE CHOICE or TRUE/FALSE */}
              {(activeQuestion.type === 'MULTIPLE_CHOICE' || activeQuestion.type === 'TRUE_FALSE') && activeQuestion.options && (
                <div className="space-y-2.5">
                  {activeQuestion.options.map((opt, oIdx) => {
                    const isSelected = selectedAnswers[activeQuestion.id] === opt;
                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleSelectOption(activeQuestion.id, opt)}
                        className={`w-full text-left p-3.5 rounded-xl border text-xs font-bold transition flex items-center gap-3 ${
                          isSelected 
                            ? 'bg-white border-indigo-600 text-indigo-800 shadow-3xs ring-2 ring-indigo-50' 
                            : 'bg-white border-slate-200 text-slate-655 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        <span className={`h-5 w-5 rounded-full border flex items-center justify-center font-mono ${
                          isSelected ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-50 text-slate-400 border-slate-200'
                        }`}>
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Type 2: MULTIPLE RESPONSE (Checkbox) */}
              {activeQuestion.type === 'MULTIPLE_RESPONSE' && activeQuestion.options && (
                <div className="space-y-2.5">
                  <span className="text-[10px] font-mono text-slate-400 block font-bold mb-1">[Học sinh chọn 2 hoặc nhiều phương án]</span>
                  {activeQuestion.options.map((opt, oIdx) => {
                    const ansList = selectedAnswers[activeQuestion.id] as string[] || [];
                    const isChecked = ansList.includes(opt);
                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleMultipleResponseToggle(activeQuestion.id, opt)}
                        className={`w-full text-left p-3.5 rounded-xl border text-xs font-bold transition flex items-center gap-3 ${
                          isChecked 
                            ? 'bg-white border-indigo-650 text-indigo-800 shadow-3xs ring-2 ring-indigo-50' 
                            : 'bg-white border-slate-200 text-slate-655 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        <div className={`h-4.5 w-4.5 rounded border flex items-center justify-center shrink-0 ${
                          isChecked ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-50 border-slate-200 text-transparent'
                        }`}>
                          <Lucide.Check className="h-3 w-3" />
                        </div>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Type 3: FILL IN THE BLANK */}
              {activeQuestion.type === 'FILL_BLANK' && (
                <div className="space-y-3 p-1">
                  <span className="text-[10px] font-mono text-slate-400 block font-bold mb-1">[Nhập câu trả lời viết thường hoặc ghi số đúng yêu cầu]</span>
                  <input
                    type="text"
                    required
                    placeholder="Nhập câu trả lời ngắn của bạn..."
                    value={selectedAnswers[activeQuestion.id] || ''}
                    onChange={(e) => handleSelectOption(activeQuestion.id, e.target.value)}
                    className="w-full text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-xl p-3 outline-none focus:border-indigo-500 hover:border-slate-300 shadow-3xs"
                    id={`quiz-input-${activeQuestion.id}`}
                  />
                </div>
              )}

              {/* Type 4: HOTSPOT (Image coordinates selection click) */}
              {activeQuestion.type === 'HOTSPOT' && activeQuestion.hotspots && (
                <div className="space-y-4">
                  <span className="text-[10px] font-mono text-slate-400 block font-bold mb-1">[Bấm trực tiếp vào vùng dải Ribbon của ảnh để chọn làm đáp án]</span>
                  <div className="border border-slate-200 rounded-xl bg-white p-3 text-center relative max-w-md mx-auto">
                    <div className="aspect-[4/2] bg-slate-50 rounded-lg relative overflow-hidden flex flex-col justify-between p-4.5 border border-slate-100 select-none">
                      {/* Representing a mock ribbon toolbar */}
                      <div className="flex justify-between border-b border-slate-200 pb-2 bg-slate-100/50 p-1 rounded">
                        <span className="text-[9px] font-mono font-bold text-slate-400">File</span>
                        <span className="text-[9px] font-mono font-bold text-slate-500">Home</span>
                        <span className="text-[9px] font-mono font-bold text-slate-400">Insert</span>
                        <span className="text-[9px] font-mono font-bold text-slate-400">Page Layout</span>
                      </div>
                      
                      <div className="my-auto">
                        <span className="text-[10px] text-slate-400 font-mono italic">Mô phỏng Giao diện thanh công cụ dải băng Microsoft Word</span>
                      </div>

                      {/* Selectable Hotspot Regions */}
                      <div className="flex justify-center gap-3.5 mt-2">
                        {activeQuestion.hotspots.map((spot) => {
                          const isSelected = selectedAnswers[activeQuestion.id] === spot.id;
                          return (
                            <button
                              key={spot.id}
                              onClick={() => handleHotspotClick(activeQuestion.id, spot.id)}
                              className={`px-3 py-1.5 border rounded-lg text-[10px] font-mono font-bold transition ${
                                isSelected 
                                  ? 'bg-indigo-600 text-white border-indigo-500 shadow'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              🔔 Vùng: {spot.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Type 5: ORDERING */}
              {activeQuestion.type === 'ORDERING' && (
                <div className="space-y-3.5">
                  <span className="text-[10px] font-mono text-slate-400 block font-bold mb-1">[Nhấp các phím mũi tên để dịch chuyển, sắp xếp theo quy trình chuẩn]</span>
                  {(() => {
                    const currentOrder = selectedAnswers[activeQuestion.id] as string[] || [...(activeQuestion.options || [])];
                    return (
                      <div className="space-y-2">
                        {currentOrder.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className="bg-white border border-slate-200 p-3.5 rounded-xl flex items-center justify-between text-xs font-bold text-slate-700 shadow-2xs"
                          >
                            <span className="font-sans">{oIdx + 1}. {opt}</span>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => handleOrderingShift(activeQuestion.id, oIdx, 'up')}
                                disabled={oIdx === 0}
                                className="h-6 w-6 rounded bg-slate-50 border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 disabled:opacity-30"
                              >
                                <Lucide.ChevronUp className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleOrderingShift(activeQuestion.id, oIdx, 'down')}
                                disabled={oIdx === currentOrder.length - 1}
                                className="h-6 w-6 rounded bg-slate-50 border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 disabled:opacity-30"
                              >
                                <Lucide.ChevronDown className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Type 6: MATCHING (Dropdown select mapping) */}
              {activeQuestion.type === 'MATCHING' && activeQuestion.matchingPairs && (
                <div className="space-y-3">
                  <span className="text-[10px] font-mono text-slate-400 block font-bold mb-1">[Chọn các phương án cột trái khớp với cột phải chuẩn xác]</span>
                  {activeQuestion.matchingPairs.map((pair, pIdx) => {
                    const currentMap = selectedAnswers[activeQuestion.id] || {};
                    const currentSelection = currentMap[pair.left] || '';
                    return (
                      <div key={pIdx} className="bg-white border border-slate-200 p-3.5 rounded-xl flex items-center justify-between gap-4 shadow-2xs">
                        <span className="text-xs font-bold text-indigo-700 font-mono">{pair.left}</span>
                        <select
                          value={currentSelection}
                          onChange={(e) => handleMatchingSelect(activeQuestion.id, pair.left, e.target.value)}
                          className="bg-slate-50 text-xs font-semibold text-slate-800 border border-slate-200 p-2 rounded-lg outline-none cursor-pointer focus:border-indigo-500 hover:border-slate-300 transition"
                        >
                          <option value="">-- Ghép nối đáp án --</option>
                          {activeQuestion.matchingPairs.map((p, otherIdx) => (
                            <option key={otherIdx} value={p.right}>{p.right}</option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>

            {/* Bottom Nav Action Row */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <button
                onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                disabled={currentIdx === 0}
                className="text-xs bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-slate-600 transition disabled:opacity-40 disabled:cursor-not-allowed font-bold"
              >
                Câu trước đó
              </button>

              <button
                onClick={submitExam}
                className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-extrabold px-5 py-2.5 rounded-xl transition shadow-sm flex items-center gap-1.5"
              >
                <Lucide.Send className="h-4 w-4" /> Nộp bài và Chấm điểm
              </button>

              {currentIdx < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIdx(prev => prev + 1)}
                  className="text-xs bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-slate-650 transition font-bold"
                >
                  Câu tiếp theo
                </button>
              ) : (
                <div className="w-20"></div>
              )}
            </div>
          </div>

          {/* AI Tutor Assistant Workspace Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-indigo-50 border border-indigo-150 p-5 rounded-2xl space-y-4 shadow-3xs">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl border border-indigo-200">
                  <Lucide.Sparkles className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold font-mono text-indigo-800 uppercase tracking-widest">Trợ lý AI GS6 Tutor</h3>
                  <p className="text-[10px] text-indigo-600 font-bold">Giải nghĩa sâu theo thời gian thực</p>
                </div>
              </div>

              <p className="text-[11px] text-slate-550 leading-relaxed font-semibold">
                Bạn gặp rắc rối, chưa thấu hiểu ý nghĩa bản chất của câu hỏi hiện hành? AI GS6 Tutor của chúng tôi sẽ giải thuật bài thi tức thời cho bạn.
              </p>

              <button
                onClick={askAiTutorExplanation}
                disabled={loadingAiTutor}
                className="w-full text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                {loadingAiTutor ? (
                  <>
                    <Lucide.Loader2 className="h-4 w-4 animate-spin" />
                    <span>AI đang phân tách...</span>
                  </>
                ) : (
                  <>
                    <Lucide.Sparkles className="h-4 w-4" />
                    <span>Giải thích câu hỏi này</span>
                  </>
                )}
              </button>

              {aiTutorResponse && (
                <div className="bg-white p-4 border border-slate-200 rounded-xl max-h-56 overflow-y-auto text-[11px] leading-relaxed text-slate-655 space-y-2.5 font-sans shadow-3xs">
                  {aiTutorResponse.split('\n').map((line, lIdx) => {
                    if (line.startsWith('###') || line.startsWith('*')) {
                      return <p key={lIdx} className="font-bold text-indigo-700 mt-1 uppercase font-mono">{line.replace(/[\*#]/g, '')}</p>;
                    }
                    return <p key={lIdx}>{line}</p>;
                  })}
                </div>
              )}
            </div>

            {/* Quick question navigation palette */}
            <div className="bg-white border border-slate-200 p-4.5 rounded-2xl space-y-3 shadow-3xs">
              <h4 className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider">BẢN ĐỒ CÂU HỎI THI THỬ</h4>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const isAnswered = selectedAnswers[q.id] !== undefined;
                  const isActive = idx === currentIdx;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIdx(idx)}
                      className={`text-[10px] font-mono h-8 rounded-lg transition font-bold border ${
                        isActive 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                          : isAnswered 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. COMPLETED / SCORECARD REPORT VIEW */}
      {examStatus === 'completed' && (
        <div className="space-y-6">
          {/* Main score bar */}
          {(() => {
            const { finalScore, correctCount } = calculateFinalResults();
            const passStatus = finalScore >= 700 ? 'PASS' : 'FAIL';
            const finalPercent = correctCount / questions.length;
            return (
              <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative shadow-3xs">
                <div className="absolute -top-10 -right-10 h-40 w-40 bg-emerald-50 rounded-full blur-3xl opacity-40"></div>
                
                <div className="flex items-center gap-5 relative z-10">
                  <div className={`h-22 w-22 rounded-full flex items-center justify-center border-4 text-center shrink-0 ${
                    passStatus === 'PASS' 
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-600' 
                      : 'border-rose-500 bg-rose-50 text-rose-600'
                  }`}>
                    <div className="p-1">
                      <span className="text-[8px] uppercase tracking-wider block font-bold font-mono text-slate-400">Đạt điểm</span>
                      <span className="text-sm font-extrabold font-mono block leading-none">{finalScore}/1000</span>
                      <span className="text-[8px] text-slate-500 block mt-0.5 font-bold">({Math.round(finalPercent * 100)}%)</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-slate-800">Kết quả kỳ khảo thí thử</h3>
                      <span className={`text-[9.5px] uppercase font-mono px-2.5 py-0.5 border rounded-full font-bold ${
                        passStatus === 'PASS' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {passStatus === 'PASS' ? 'KỲ THI ĐẠT' : 'CHƯA ĐẠT'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-550 leading-relaxed mt-1.5 font-semibold">
                      Bạn làm đúng <span className="text-indigo-600 font-bold">{correctCount} / {questions.length}</span> câu hỏi ({Math.round(finalPercent * 100)}% độ chính xác).
                    </p>
                    <p className="text-[10.5px] text-slate-400 mt-1 leading-relaxed max-w-xl">
                      * Thang điểm Certiport quy quy đổi chuẩn từ 100 đến 1000 điểm. Để tránh việc học sinh hiểu lầm nhận được điểm tuyệt đối (100 trên thang điểm 100 của Việt Nam) khi làm sai hết, hệ thống sẽ trả về **0/1000** điểm nếu làm sai toàn bộ 0% câu hỏi.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2.5 relative z-10">
                  <button
                    onClick={startExam}
                    className="text-xs font-bold border border-slate-250 bg-white hover:bg-slate-50 text-slate-655 px-4 py-2.5 rounded-xl transition"
                  >
                    Khảo thí thi lại
                  </button>

                  <button
                    onClick={askAiAnalyticsOverview}
                    disabled={loadingAiAnalytics}
                    className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4.5 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-sm"
                  >
                    {loadingAiAnalytics ? (
                      <>
                        <Lucide.Loader2 className="h-4 w-4 animate-spin" />
                        <span>AI đang phân tích...</span>
                      </>
                    ) : (
                      <>
                        <Lucide.Sparkles className="h-4 w-4" />
                        <span>Nhận AI Analytics</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })()}

          {/* AI Analytics specifications mapping */}
          {aiAnalyticsResponse && (
            <div className="bg-white border border-slate-250 p-6 rounded-2xl space-y-5 shadow-3xs animate-fadeIn">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="p-2 bg-indigo-50 border border-indigo-100 text-indigo-650 rounded-xl">
                  <Lucide.TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold font-mono text-indigo-750 uppercase tracking-widest">AI LEARNING ANALYTICS (PREDICTIONS)</h3>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">Xác suất thành công Certiport thực tế và khuyến cáo bồi dưỡng</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                
                {/* pass rate circular simulation */}
                <div className="md:col-span-4 text-center space-y-2 p-5 bg-emerald-50/50 rounded-2xl border border-emerald-150">
                  <span className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-wider block">XÁC SUẤT BẤT BẠI</span>
                  <div className="text-3xl font-extrabold text-emerald-600 font-mono tracking-tight">
                    {aiAnalyticsResponse.predictedPassRate}%
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal font-semibold">Tỷ lệ tương thích dự kiến đạt chứng chỉ IC3 GS6 thực tế nếu thi tại trung tâm.</p>
                </div>

                {/* weaknesses & custom roadmap */}
                <div className="md:col-span-8 space-y-4">
                  {/* blind spots */}
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-extrabold text-slate-800">Các mảng kiến thức rủi ro cao:</h4>
                    <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 pl-1 font-semibold">
                      {aiAnalyticsResponse.weaknesses?.map((w: string, idx: number) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>
                  </div>

                  {/* roadmap */}
                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-extrabold text-slate-800">Lộ trình bồi dưỡng tăng cường kế tiếp:</h4>
                    <div className="space-y-2.5">
                      {aiAnalyticsResponse.roadmap?.map((rm: any, idx: number) => (
                        <div key={idx} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex gap-3.5 items-start">
                          <span className="text-[9.5px] font-mono font-bold text-indigo-700 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 border border-indigo-150 rounded">
                            Pha {idx + 1}
                          </span>
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-slate-800 block">{rm.phase}</span>
                            <p className="text-[10.5px] text-slate-550 leading-relaxed font-sans font-semibold">{rm.actions}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sổ điểm sửa chữa lỗi sai */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-3.5 shadow-3xs">
            <h4 className="text-xs font-bold font-mono text-slate-400 uppercase flex items-center gap-1.5">
              <Lucide.HelpCircle className="h-4 w-4 text-indigo-500" /> SỔ GHI CHÚA SỬA SAI ĐÁP ÁN KỲ KHẢO THÍ CHUẨN
            </h4>
            <div className="space-y-3">
              {questions.map((q, idx) => {
                const userAns = selectedAnswers[q.id];
                const isCorrect = String(userAns || '').toLowerCase().trim() === String(q.correctAnswer).toLowerCase().trim() ||
                                  (q.type === 'MATCHING' && userAns && Object.keys(q.correctAnswer as Record<string, string>).every(k => (userAns as Record<string, string>)[k] === (q.correctAnswer as Record<string, string>)[k]));
                return (
                  <details key={q.id} className="bg-slate-50 hover:bg-slate-50/80 p-3.5 border border-slate-200 rounded-xl group text-xs transition">
                    <summary className="flex justify-between items-center cursor-pointer select-none gap-4">
                      <div className="flex items-center gap-3">
                        <span className={`h-5 w-5 rounded-full flex items-center justify-center font-mono font-bold text-[10px] ${
                          isCorrect ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-rose-50 border border-rose-200 text-rose-700'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="font-extrabold text-slate-800 line-clamp-1">{q.questionText}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[9px] shrink-0 font-bold">
                        <span className={`px-2 py-0.5 rounded ${isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          {isCorrect ? 'Chuẩn xác' : 'Bị rủi ro sai'}
                        </span>
                        <Lucide.ChevronDown className="h-4 w-4 text-slate-400 group-open:rotate-180 transition-all duration-150" />
                      </div>
                    </summary>

                    <div className="pt-4 border-t border-slate-200 mt-3 space-y-2.5 text-xs text-slate-655 leading-relaxed font-sans font-semibold">
                      <p><strong className="text-slate-500 font-mono">Lựa chọn của học viên:</strong> <span className="text-indigo-700 font-mono font-bold">{JSON.stringify(userAns || "Học viên bỏ trống")}</span></p>
                      <p><strong className="text-emerald-600 font-mono">Đáp án Certiport công nhận:</strong> <span className="text-emerald-700 font-mono font-bold">{JSON.stringify(q.correctAnswer)}</span></p>
                      <p className="bg-white border border-slate-200 p-3.5 rounded-xl text-slate-500 leading-relaxed font-medium italic text-[11px] mt-2 border-l-4 border-l-indigo-600">
                        {q.explanation}
                      </p>
                    </div>
                  </details>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
