import React, { useState } from 'react';
import { CourseModule, Lesson } from '../types';
import * as Lucide from 'lucide-react';
import { IC3_THEORY_DATA } from '../theoryData';

interface CourseExplorerProps {
  courses: CourseModule[];
  onCompleteLesson: (moduleId: string, lessonId: string, xpReward: number) => void;
}

export default function CourseExplorer({ courses, onCompleteLesson }: CourseExplorerProps) {
  const [selectedModuleId, setSelectedModuleId] = useState<string>(courses[0]?.id || '');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [pdfDownloaded, setPdfDownloaded] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<'theory' | 'activity'>('theory');
  const [activeVideoUrl, setActiveVideoUrl] = useState<string>('https://assets.mixkit.co/videos/preview/mixkit-typing-on-a-computer-keyboard-41315-large.mp4');
  const [videoTime, setVideoTime] = useState<number>(0);

  const selectedModule = courses.find((c) => c.id === selectedModuleId);

  const handleSelectModule = (id: string) => {
    setSelectedModuleId(id);
    setActiveLesson(null);
    setPdfDownloaded(false);
  };

  const startLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setCurrentFlashcardIndex(0);
    setIsFlipped(false);
    setPdfDownloaded(false);
    setActiveSubTab('theory'); // Always open theory textbook first
  };

  const handleCompleteActiveLesson = () => {
    if (!selectedModule || !activeLesson) return;
    if (activeLesson.isCompleted) return;

    onCompleteLesson(selectedModule.id, activeLesson.id, activeLesson.xpReward);
    
    // update local state
    setActiveLesson({
      ...activeLesson,
      isCompleted: true
    });
  };

  // Helper to fallback if specific theory content isn't in theoryData
  const getTheoryContentForLesson = (lesson: Lesson): typeof IC3_THEORY_DATA[string] => {
    if (IC3_THEORY_DATA[lesson.id]) {
      return IC3_THEORY_DATA[lesson.id];
    }
    
    // Generate high-quality default theory dynamically for other lessons
    return {
      lessonId: lesson.id,
      title: lesson.title,
      category: selectedModule?.title || "Kiến thức số IC3",
      summary: `Nội dung ôn bồi và các tác vụ rèn luyện cốt lõi của bài học '${lesson.title}'. Đơn vị kiến thức kiểm soát theo cấu trúc sơ đồ Certiport mới nhất.`,
      keyConcepts: [
        { term: "Định nghĩa mục tiêu", definition: "Nắm vững lý thuyết nền tảng cấu thành, các khái niệm chuyên ngành liên quan trực tiếp đến nội dung ôn tập." },
        { term: "Tác vụ thực tế", definition: "Khả năng phản xạ thao tác chính xác trên các giao diện phần mềm Windows 11 và Microsoft 365." }
      ],
      detailedContent: `
### I. Hướng Dẫn Lý Thuyết Chuyên Sâu Của Bài Học
Để chuẩn bị tốt nhất cho các dạng câu hỏi trong bài kiểm tra của Certiport cho nội dung này, bạn cần hiểu rõ các nguyên tắc sau đây:
* **Tầm quan trọng của tiêu chuẩn**: Đảm bảo tất cả quy trình thực hành bám sát cấu trúc của tệp hướng dẫn sử dụng.
* **Mẹo ghi nhớ cực nhanh**: Chú ý đến các tổ hợp phím tắt hỗ trợ và các mũi tên dải Ribbon trên thanh công cụ chính.
* **Cách tránh sai sót khi thi**: Đọc chậm và kỹ đề bài, xác định rõ đối tượng mục tiêu trước khi bấm click hay thực hiện thao tác kéo thả.

### II. Chi Tiết Thực Hành Chuẩn Hóa
1. Bước chuẩn bị: Khởi động cửa sổ phần mềm và kiểm tra tùy chọn cấu hình dải băng.
2. Thực thi: Thao tác tuần tự. Không thực hiện thừa các bước click trung gian để tránh bị trừ điểm hệ thống.
3. Kiểm tra: Xác nhận kết quả hiển thị trên màn hình trùng khớp với hình minh họa yêu cầu đề thi.
      `,
      reviewQuestions: [
        { question: "Làm thế nào để ghi nhớ tốt nhất các kiến thức lý thuyết số phức tạp?", answer: "Học tập thông qua sơ đồ liên kết (Mindmap), ôn luyện ghi nhớ trực tiếp qua bộ Flashcards thuật ngữ và rèn luyện các bài kiểm thí thực tế." },
        { question: "Nguyên tắc thao tác tối ưu trên giao diện Microsoft Office là gì?", answer: "Hãy ưu tiên sử dụng phím tắt tương ứng được thiết kế để đẩy nhanh tốc độ thực hiện và giữ tính chuẩn xác phần mềm." }
      ]
    };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Course Sidebar Selector - Bright Vibe */}
      <div className="lg:col-span-4 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Lucide.Compass className="h-4 w-4 text-indigo-600" />
          <h3 className="text-xs font-bold font-mono tracking-widest text-slate-500 uppercase">CÁC MODULE IC3 GS6</h3>
        </div>
        <div className="space-y-3">
          {courses.map((course) => {
            const isSelected = course.id === selectedModuleId;
            return (
              <button
                key={course.id}
                onClick={() => handleSelectModule(course.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all relative overflow-hidden flex flex-col gap-2 ${
                  isSelected 
                    ? 'bg-white border-indigo-600 shadow-md ring-2 ring-indigo-100' 
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                }`}
                id={`btn-course-${course.id}`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className={`text-[10px] font-mono tracking-wider font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                    isSelected 
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                      : 'bg-slate-100 border-slate-200 text-slate-600'
                  }`}>
                    {course.code}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-600">{course.progress}%</span>
                </div>
                <div>
                  <h4 className={`text-sm font-bold ${isSelected ? 'text-slate-900' : 'text-slate-800'}`}>
                    {course.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{course.description}</p>
                </div>
                
                {/* Custom Gradient Progress Bar */}
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-sky-500 rounded-full"
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Course Content Area - Beautiful white card */}
      <div className="lg:col-span-8">
        {selectedModule ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-150 pb-5">
              <div>
                <span className="text-xs font-bold font-mono text-indigo-600 tracking-wider uppercase mb-1 block">
                  CHƯƠNG TRÌNH ĐÀO TẠO
                </span>
                <h2 className="text-lg md:text-xl font-bold text-slate-900">{selectedModule.title}</h2>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600 font-mono bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-lg">
                <Lucide.BookOpen className="h-4 w-4 text-indigo-600" />
                <span className="font-bold">{selectedModule.lessons.length} Bài học & Lý thuyết chuẩn</span>
              </div>
            </div>

            {/* If no lesson selected, show list of lessons */}
            {!activeLesson ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold font-mono tracking-wider text-slate-400 uppercase">
                    DANH SÁCH BÀI HỌC LÝ THUYẾT & THỰC HÀNH
                  </h3>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md font-mono font-bold block">
                    ✓ Chấm điểm tự động qua Firebase
                  </span>
                </div>
                {selectedModule.lessons.map((lesson) => {
                  return (
                    <div
                      key={lesson.id}
                      className="bg-slate-50/50 hover:bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-xl border ${
                          lesson.isCompleted 
                            ? 'text-emerald-600 border-emerald-200 bg-emerald-50' 
                            : 'text-indigo-600 border-indigo-100 bg-indigo-50/50'
                        }`}>
                          {lesson.isCompleted ? (
                            <Lucide.CheckCircle2 className="h-5 w-5" />
                          ) : lesson.type === 'video' ? (
                            <Lucide.Tv className="h-5 w-5" />
                          ) : lesson.type === 'pdf' ? (
                            <Lucide.FileText className="h-5 w-5" />
                          ) : lesson.type === 'flashcard' ? (
                            <Lucide.Layers className="h-5 w-5" />
                          ) : (
                            <Lucide.Bookmark className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800 leading-snug">{lesson.title}</h4>
                          <div className="flex flex-wrap items-center gap-2 text-[10.5px] text-slate-500 font-mono mt-1">
                            <span className="capitalize bg-slate-250 px-2 py-0.5 rounded text-slate-600 font-bold bg-slate-200/50">
                              {lesson.type}
                            </span>
                            <span>•</span>
                            <span>{lesson.duration}</span>
                            <span>•</span>
                            <span className="text-indigo-600 font-bold">+{lesson.xpReward} XP Thưởng</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => startLesson(lesson)}
                        className={`text-xs px-4 py-2 rounded-xl transition font-bold flex items-center gap-2 ${
                          lesson.isCompleted
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                        }`}
                        id={`btn-start-${lesson.id}`}
                      >
                        {lesson.isCompleted ? 'Ôn lý thuyết' : 'Vào Học Ngay'}
                        <Lucide.ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* ACTIVE LESSON VIEW WITH ACTUAL COMPREHENSIVE TEXTBOOK THEORY */
              <div className="space-y-6">
                {/* Back button */}
                <button
                  onClick={() => setActiveLesson(null)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-bold flex items-center gap-1.5 transition"
                >
                  <Lucide.ArrowLeft className="h-4 w-4" /> Quay lại danh sách bài học
                </button>

                {/* Lesson Title Bar - Elegant & Bright */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span className="text-[10px] font-mono tracking-wider text-indigo-700 font-bold uppercase bg-indigo-50 px-2 py-0.5 border border-indigo-200 rounded-md">
                      BÀI HỌC ĐANG CHỌN
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{activeLesson.title}</h3>
                  </div>
                  <div className="text-right sm:text-right">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">Tiến trình XP:</span>
                    <span className="text-sm font-extrabold text-emerald-600 font-mono">+{activeLesson.xpReward} XP</span>
                  </div>
                </div>

                {/* Sub-navigation inside lesson to switch between Textbook Theory and Practical Tools */}
                <div className="flex border-b border-slate-150">
                  <button
                    onClick={() => setActiveSubTab('theory')}
                    className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition ${
                      activeSubTab === 'theory'
                        ? 'border-indigo-600 text-indigo-600 bg-indigo-50/10'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Lucide.BookOpenCheck className="h-4 w-4" />
                    Giáo Trình Lý Thuyết Chuẩn
                  </button>
                  <button
                    onClick={() => setActiveSubTab('activity')}
                    className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition ${
                      activeSubTab === 'activity'
                        ? 'border-indigo-600 text-indigo-600 bg-indigo-50/10'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Lucide.Activity className="h-4 w-4" />
                    Thẻ Tương Tác / Thực Hành ({activeLesson.type})
                  </button>
                </div>

                {/* TAB 1: THE TEXTBOOK THEORY (Addressing 'lý thuyết đâu???' perfectly) */}
                {activeSubTab === 'theory' && (
                  <div className="space-y-6 animate-fadeIn">
                    {/* Theory introduction cards */}
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50/30 border border-emerald-100 p-4 rounded-xl">
                      <h4 className="text-xs font-extrabold text-emerald-800 uppercase tracking-widest font-mono flex items-center gap-1.5 mb-1.5">
                        <Lucide.Sparkles className="h-3.5 w-3.5 text-emerald-600" /> Tóm tắt lý thuyết cốt lõi (Certiport Syllabus)
                      </h4>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        {getTheoryContentForLesson(activeLesson).summary}
                      </p>
                    </div>

                    {/* Key Concepts Dictionary */}
                    <div className="space-y-2.5">
                      <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">
                        THUẬT NGỮ CẦN NẮM VỮNG TRONG ĐỀ THI
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {getTheoryContentForLesson(activeLesson).keyConcepts.map((concept, idx) => (
                          <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-300 transition">
                            <span className="text-xs font-bold text-indigo-600 font-mono block mb-1">
                              {concept.term}
                            </span>
                            <span className="text-[11px] text-slate-600 leading-relaxed block">
                              {concept.definition}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Detailed Chapter Textbook Content */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-2xs">
                      <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                        SÁCH GIÁO KHOA SỐ IC3 GS6 VĂN PHÒNG
                      </span>
                      <div className="prose prose-slate max-w-none text-xs text-slate-700 leading-relaxed font-sans space-y-3">
                        {getTheoryContentForLesson(activeLesson).detailedContent.split('\n\n').map((para, i) => {
                          if (!para.trim()) return null;
                          if (para.trim().startsWith('###')) {
                            return <h4 key={i} className="text-sm font-bold text-slate-900 pt-2 border-b border-slate-100 pb-1 flex items-center gap-1">{para.replace('###', '').trim()}</h4>;
                          }
                          if (para.trim().startsWith('*')) {
                            return (
                              <ul key={i} className="list-disc pl-5 space-y-1 mt-1 text-slate-600">
                                {para.split('\n').map((li, liIdx) => (
                                  <li key={liIdx}>{li.replace('*', '').trim()}</li>
                                ))}
                              </ul>
                            );
                          }
                          if (para.trim().startsWith('1.') || para.trim().startsWith('2.') || para.trim().startsWith('3.')) {
                            return (
                              <ol key={i} className="list-decimal pl-5 space-y-1 mt-1 text-slate-600">
                                {para.split('\n').map((li, liIdx) => (
                                  <li key={liIdx}>{li.trim()}</li>
                                ))}
                              </ol>
                            );
                          }
                          return <p key={i}>{para.trim()}</p>;
                        })}
                      </div>
                    </div>

                    {/* Shortcuts or Extra Tables (if defined) */}
                    {getTheoryContentForLesson(activeLesson).shortcutsOrTables && (
                      <div className="space-y-2.5">
                        <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">
                          BẢNG PHÍM TẮT & CHUẨN ĐO LƯỜNG LÝ THUYẾT
                        </h4>
                        <div className="overflow-hidden border border-slate-200 rounded-xl">
                          <table className="min-w-full divide-y divide-slate-200 text-xs">
                            <thead className="bg-slate-50 font-bold text-slate-700">
                              <tr>
                                <th className="px-4 py-2.5 text-left font-mono">Tham số / Tổ hợp phím</th>
                                <th className="px-4 py-2.5 text-left">Tác vụ xử lý</th>
                                <th className="px-4 py-2.5 text-left text-slate-500">Mô tả vận dụng thực tế</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-150 text-slate-600">
                              {getTheoryContentForLesson(activeLesson).shortcutsOrTables?.map((row, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50">
                                  <td className="px-4 py-2.5 font-bold text-indigo-700 font-mono">{row.key}</td>
                                  <td className="px-4 py-2.5 font-medium">{row.action}</td>
                                  <td className="px-4 py-2.5 text-slate-500 text-[11px]">{row.description}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Self-Test Review Section */}
                    <div className="space-y-3 mt-4 border-t border-slate-150 pt-5">
                      <h4 className="text-xs font-bold font-mono text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                        <Lucide.MessageSquareQuote className="h-4 w-4 text-indigo-500" /> CÂU HỎI TỰ KIỂM TRA NHANH (SELF-TEST)
                      </h4>
                      <div className="space-y-4">
                        {getTheoryContentForLesson(activeLesson).reviewQuestions.map((q, idx) => (
                          <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-150 space-y-1.5">
                            <span className="text-[11px] font-bold text-slate-800 block">
                              Mục {idx + 1}: {q.question}
                            </span>
                            <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 leading-relaxed">
                              <span className="font-bold text-emerald-600 block mb-0.5">Đáp án giải nghĩa chuẩn Certiport:</span>
                              {q.answer}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quick validation finish checkbox */}
                    <div className="bg-indigo-50/40 p-4 rounded-xl border border-indigo-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div className="text-left">
                        <h5 className="text-xs font-bold text-slate-800">Bạn đã hoàn tất tìm hiểu lý thuyết?</h5>
                        <p className="text-[10.5px] text-slate-500">Bấm xác nhận học thuộc lý thuyết chương này để tích lũy XP trong tài khoản.</p>
                      </div>
                      <button
                        onClick={handleCompleteActiveLesson}
                        disabled={activeLesson.isCompleted}
                        className={`text-xs px-4.5 py-2 rounded-xl font-bold transition flex items-center gap-1.5 ${
                          activeLesson.isCompleted
                            ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-200 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                        }`}
                      >
                        {activeLesson.isCompleted ? (
                          <>
                            <Lucide.Check className="h-4 w-4" /> Đã hoàn thành bài học
                          </>
                        ) : (
                          <>
                            <Lucide.BookmarkCheck className="h-4 w-4" /> Xác nhận học xong lý thuyết
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                )}

                {/* TAB 2: SPECIAL ACTIVITY PLAYER (Videos, Interactive Simulator or Flashcards) */}
                {activeSubTab === 'activity' && (
                  <div className="space-y-6 animate-fadeIn">
                    
                    {/* VIDEO INTERACTIVE PLAYER */}
                    {activeLesson.type === 'video' && (
                      <div className="space-y-4">
                        <div className="aspect-video w-full rounded-2xl border border-slate-300 bg-slate-950 relative overflow-hidden shadow-md">
                          <video 
                            key={activeVideoUrl}
                            src={activeVideoUrl}
                            controls
                            className="w-full h-full rounded-2xl outline-none"
                            onTimeUpdate={(e) => setVideoTime((e.target as HTMLVideoElement).currentTime)}
                          />
                        </div>

                        {/* Custom Dynamic Synchronized Subtitles block */}
                        <div className="bg-slate-900 text-white p-3.5 rounded-xl border border-slate-800 text-center space-y-1 animate-fadeIn">
                          <span className="text-[9px] uppercase tracking-widest font-bold text-indigo-400 font-mono block">PHỤ ĐỀ TIẾNG VIỆT TỰ ĐỘNG (DƯỚI TRÌNH PHÁT)</span>
                          <p className="text-xs font-medium leading-relaxed font-sans text-slate-100 italic">
                            "{videoTime < 3 ? "Chào mừng bạn đến với video bài học tin học chuẩn quốc tế IC3 GS6." 
                             : videoTime < 7 ? "Trong bài học này, chúng ta học chuyên sâu về dải băng Ribbon và các thực hành chuẩn."
                             : videoTime < 12 ? "Hãy lưu ý kỹ từng nhấp chuột và các phím tắt bổ sung để đạt điểm ưu tối đa."
                             : videoTime < 18 ? "Vui lòng hoàn thành quá trình xem và đánh dấu hoàn tất để tích lũy 50 XP!"
                             : "Hãy học kết hợp song song với nhãn 'Giáo Trình Lý Thuyết Chuẩn' để đạt kết quả xuất sắc!"}"
                          </p>
                        </div>

                        {/* Interactive Server switches & Instructions */}
                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <span className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-wider block">CHỌN MÁY CHỦ BÀI GIẢNG TRỰC QUYẾN (CDN FEEDS)</span>
                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md font-mono">
                              * Tránh bị chặn nội tuyến
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { name: "Server 1 (Chuẩn)", url: "https://assets.mixkit.co/videos/preview/mixkit-typing-on-a-computer-keyboard-41315-large.mp4" },
                              { name: "Server 2 (Chi Tiết)", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4" },
                              { name: "Server 3 (Cơ Bản)", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" }
                            ].map((srv, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setActiveVideoUrl(srv.url);
                                  setVideoTime(0);
                                }}
                                className={`p-2 rounded-lg border text-[10.5px] font-bold transition flex items-center justify-center gap-1.5 ${
                                  activeVideoUrl === srv.url
                                    ? 'bg-indigo-50 border-indigo-600 text-indigo-700'
                                    : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-600'
                                }`}
                              >
                                <Lucide.Tv className="h-3 w-3" />
                                {srv.name}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                          <span className="text-xs text-slate-500 font-bold">Hoàn tất quá trình học tập video bài giảng để ghi nhận XP:</span>
                          <button
                            onClick={handleCompleteActiveLesson}
                            disabled={activeLesson.isCompleted}
                            className={`text-xs px-4 py-2 rounded-xl font-bold transition duration-150 ${
                              activeLesson.isCompleted 
                                ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-200 cursor-not-allowed' 
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                            }`}
                          >
                            {activeLesson.isCompleted ? '✓ Đã hoàn tất bài video' : 'Đánh dấu Hoàn thành'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* PDF HANDBOOK DOWNLOAD SECTION */}
                    {activeLesson.type === 'pdf' && (
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-5 text-center">
                        <div className="h-16 w-16 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                          <Lucide.FileText className="h-8 w-8" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">{activeLesson.pdfTitle || "Cẩm nang ôn luyện thi IC3"}</h4>
                          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                            Tài liệu cẩm nang độc quyền được lưu hành nội bộ, liên kết tóm tắt toàn bộ 12 chương lý thuyết trọng tâm của Certiport Global Standard 6.
                          </p>
                        </div>

                        <div className="flex flex-wrap justify-center gap-3">
                          <button
                            onClick={() => setPdfDownloaded(true)}
                            className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition flex items-center gap-2 shadow-sm font-bold"
                          >
                            <Lucide.Download className="h-4 w-4" /> Tải cẩm nang PDF mẫu về máy
                          </button>
                          
                          {pdfDownloaded && (
                            <button
                              onClick={handleCompleteActiveLesson}
                              disabled={activeLesson.isCompleted}
                              className={`text-xs px-5 py-2.5 rounded-xl font-bold transition duration-150 ${
                                activeLesson.isCompleted 
                                  ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-200 cursor-not-allowed' 
                                  : 'bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50'
                              }`}
                            >
                              {activeLesson.isCompleted ? '✓ Đăng tài liệu rồi' : 'Xác nhận Đã đọc xong'}
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* FLASHCARDS INTERACTIVE PRACTICE CONTAINER */}
                    {activeLesson.type === 'flashcard' && activeLesson.flashcards && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-xs text-slate-500 font-mono font-bold">
                          <span>Thẻ mã số {currentFlashcardIndex + 1} / {activeLesson.flashcards.length}</span>
                          <span className="flex items-center gap-1"><Lucide.Fingerprint className="h-3 w-3 text-indigo-600" /> Click trực tiếp vào để lật</span>
                        </div>

                        {/* Beautiful bright flashcard flip card */}
                        <div 
                          onClick={() => setIsFlipped(!isFlipped)}
                          className="cursor-pointer aspect-video w-full rounded-2xl border-2 border-slate-250 bg-slate-50 p-6 flex flex-col justify-center items-center text-center transition-all duration-300 relative select-none hover:border-indigo-600 hover:shadow-md"
                        >
                          <div className="absolute top-4 right-4 text-[9px] bg-white text-slate-500 border border-slate-200 px-2 py-1 rounded-md flex items-center gap-1 font-bold">
                            <Lucide.RefreshCw className="h-2.5 w-2.5 text-indigo-600 animate-spin-slow" /> LẬT THẺ THUẬT NGỮ
                          </div>
                          
                          {!isFlipped ? (
                            <div className="space-y-2">
                              <span className="text-[10px] text-indigo-600 uppercase tracking-widest font-mono font-bold">THUẬT NGỮ IC3 CHUẨN</span>
                              <h3 className="text-lg md:text-xl font-extrabold text-slate-900 font-mono tracking-tight">{activeLesson.flashcards[currentFlashcardIndex].front}</h3>
                            </div>
                          ) : (
                            <div className="space-y-2 px-6">
                              <span className="text-[10px] text-emerald-600 uppercase tracking-widest font-mono font-bold">ĐỊNH NGHĨA HOÀN CHỈNH</span>
                              <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-semibold">{activeLesson.flashcards[currentFlashcardIndex].back}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between items-center gap-4">
                          <button
                            onClick={() => {
                              setCurrentFlashcardIndex(prev => Math.max(0, prev - 1));
                              setIsFlipped(false);
                            }}
                            disabled={currentFlashcardIndex === 0}
                            className="text-xs bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-slate-600 transition flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed font-bold"
                          >
                            <Lucide.ChevronLeft className="h-4 w-4" /> Thẻ cũ hơn
                          </button>

                          {currentFlashcardIndex < activeLesson.flashcards.length - 1 ? (
                            <button
                              onClick={() => {
                                setCurrentFlashcardIndex(prev => prev + 1);
                                setIsFlipped(false);
                              }}
                              className="text-xs bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-slate-600 transition flex items-center gap-1 font-bold"
                            >
                              Thẻ tiếp theo <Lucide.ChevronRight className="h-4 w-4 text-indigo-600" />
                            </button>
                          ) : (
                            <button
                              onClick={handleCompleteActiveLesson}
                              disabled={activeLesson.isCompleted}
                              className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition font-bold shadow-sm"
                            >
                              {activeLesson.isCompleted ? '✓ Đã hoàn tất cả bộ' : 'Hoàn tất ghi nhớ bộ thẻ'}
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* INTERACTIVE WORKBOOKS LAB / PRACTICE */}
                    {activeLesson.type === 'practice' && (
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-5">
                        <div className="flex items-center gap-2.5">
                          <Lucide.Terminal className="h-5 w-5 text-indigo-600 animate-pulse" />
                          <h4 className="text-sm font-bold text-slate-800">Đề bài tập thực hành nâng cao qua Microsoft 365</h4>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                          Khởi tạo một bảng danh sách Microsoft Excel tối thiểu 20 dòng. Áp dụng công thức liên kết logic có chứa hàm **VLOOKUP** tham chiếu chính xác đến bảng thông tin phòng ban, khóa dòng bằng phím **F4** và gửi nộp bài tập.
                        </p>

                        {/* File drag and drop placeholder */}
                        <div className="border-2 border-dashed border-slate-250 hover:border-indigo-500 bg-white p-6 rounded-xl text-center space-y-3 cursor-pointer transition">
                          <Lucide.UploadCloud className="h-8 w-8 text-indigo-500 mx-auto" />
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">Kéo thả tệp tin Excel thực hành của bạn tại đây</span>
                            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">Hỗ trợ các định dạng: .xlsx, .xls tối đa 15MB</span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[10.5px] text-slate-500 font-mono">
                          <span className="flex items-center gap-1 font-bold text-emerald-600">
                            <Lucide.Cpu className="h-4 w-4" /> Hệ thống chấm điểm tự động đã kích hoạt
                          </span>
                          <button
                            onClick={handleCompleteActiveLesson}
                            disabled={activeLesson.isCompleted}
                            className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition font-bold shadow-sm"
                          >
                            {activeLesson.isCompleted ? '✓ Đã ghi nhận bài nộp' : 'Xác nhận Nộp bài'}
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                )}

              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <p className="text-slate-500 font-bold">Vui lòng chọn một Module khóa học bên trái để tiếp tục bồi dưỡng.</p>
          </div>
        )}
      </div>
    </div>
  );
}
