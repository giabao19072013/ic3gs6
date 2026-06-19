import React, { useState } from 'react';
import { ENTERPRISE_DOCS } from '../documentationData';
import * as Lucide from 'lucide-react';

export default function DocExplorer() {
  const [activeCategory, setActiveCategory] = useState<string>('vision_srs');
  const [activeSectionId, setActiveSectionId] = useState<string>('vision_doc');
  const [tableSearch, setTableSearch] = useState<string>('');
  const [apiSimulatorUrl, setApiSimulatorUrl] = useState<string>('/api/v1/exams/sessions/start');
  const [mockResponseOutput, setMockResponseOutput] = useState<string>('');

  const activeCategoryObj = ENTERPRISE_DOCS.find((c) => c.id === activeCategory);
  const activeSection = activeCategoryObj?.sections.find((s) => s.id === activeSectionId);

  // Dynamic selector icons
  const renderCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Compass': return <Lucide.Compass className="h-4.5 w-4.5" />;
      case 'ListChecks': return <Lucide.ListChecks className="h-4.5 w-4.5" />;
      case 'Database': return <Lucide.Database className="h-4.5 w-4.5" />;
      case 'Code': return <Lucide.Code2 className="h-4.5 w-4.5" />;
      case 'ShieldAlert': return <Lucide.ShieldCheck className="h-4.5 w-4.5" />;
      case 'TrendingUp': return <Lucide.TrendingUp className="h-4.5 w-4.5" />;
      default: return <Lucide.FileText className="h-4.5 w-4.5" />;
    }
  };

  const dbTablesList = [
    { name: 'users', desc: 'Lưu trữ thông tin cơ sở của toàn bộ tài khoản học sinh, giáo viên và quản trị hệ thống.' },
    { name: 'roles', desc: 'Phục vụ truy quét vai trò kiểm soát truy cập dựa trên vai trò (RBAC).' },
    { name: 'user_profiles', desc: 'Hồ sơ người dùng chi tiết, thông tin trường, khối lớp học, ngày sinh.' },
    { name: 'refresh_tokens', desc: 'Quản lý refresh tokens phục vụ cơ chế đăng nhập Remember Me an toàn.' },
    { name: 'user_xp_history', desc: 'Lưu vết lịch sử cộng XP từ các hoạt động học tập phục vụ Gamification.' },
    { name: 'badges', desc: 'Chứa bộ sưu tập huy hiệu thành tích của hệ thống và điều kiện mở khóa.' },
    { name: 'user_badges', desc: 'Liên kết phản ánh các huy hiệu đã được mở khóa bởi từng học viên.' },
    { name: 'modules', desc: 'Ba mô-đun chính theo khung chương trình IC3 GS6.' },
    { name: 'lessons', desc: 'Danh sách các bài học (Video, Văn bản, Tác vụ Thực hành).' },
    { name: 'lesson_progress', desc: 'Theo dõi tỷ lệ phần trăm xem và hoàn tất bài học của học viên.' },
    { name: 'questions', desc: 'Ngân hàng 100.000+ câu hỏi đa dạng loại hình Certiport.' },
    { name: 'question_options', desc: 'Lưu trữ các lựa chọn đáp án tương thích cho dạng câu hỏi Multiple Choice/Response.' },
    { name: 'question_hotspots', desc: 'Tọa độ và bán kính các điểm khoanh tròn cho dạng câu hỏi nhấp chuột Hotspot.' },
    { name: 'exam_sessions', desc: 'Bản lưu các phiên làm bài thi thử chính thức của học sinh.' },
    { name: 'student_answers', desc: 'Lưu vết cụ thể đáp án học sinh nhập cho từng câu hỏi trong phiên thi.' },
    { name: 'classes', desc: 'Mã lớp học kết cấu do Giáo viên chủ nhiệm khởi tạo.' },
    { name: 'class_enrollments', desc: 'Học sinh đăng ký tham gia lớp học thông qua mã Code.' },
    { name: 'ai_analytics_reports', desc: 'Lưu báo cáo dự báo pass rate và hướng đào tạo tối ưu hóa bởi AI.' },
    { name: 'tenant_contracts', desc: 'Hợp đồng bản quyền đăng ký hệ thống cho các trường học/trung tâm liên kết.' },
    { name: 'system_audit_logs', desc: 'Nhật ký kiểm toán hệ thống ghi nhận mọi hành vi quản trị bảo mật.' }
  ];

  const filteredTables = dbTablesList.filter(
    (t) => t.name.toLowerCase().includes(tableSearch.toLowerCase()) || 
           t.desc.toLowerCase().includes(tableSearch.toLowerCase())
  );

  const simulateApiCall = (endpoint: string) => {
    switch (endpoint) {
      case '/api/v1/exams/sessions/start':
        setMockResponseOutput(JSON.stringify({
          success: true,
          sessionId: "sess_sim_99201",
          timeLimitSeconds: 2700,
          questionsCount: 45,
          timestamp: "2026-06-18T14:45:00Z"
        }, null, 2));
        break;
      case '/api/v1/auth/register':
        setMockResponseOutput(JSON.stringify({
          success: true,
          message: "Đăng ký thành công tài khoản mới",
          userId: "usr_sim_5521",
          otpSent: true,
          emailSentTo: "nguyenbao42013@gmail.com"
        }, null, 2));
        break;
      case '/api/ai/tutor':
        setMockResponseOutput(JSON.stringify({
          success: true,
          mode: "live",
          text: "Phân tích AI: Ký tự S trong giao thức HTTPS đại diện cho từ SECURE. Giúp mã hóa nội dung gửi giữa trình duyệt..."
        }, null, 2));
        break;
      default:
        setMockResponseOutput('{"status": "404 Not Found"}');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Category Sidebar Navigation */}
      <div className="lg:col-span-3 space-y-4">
        <h3 className="text-[10px] font-bold font-mono tracking-widest text-slate-400 mb-2 uppercase">DANH MỤC THIẾT KẾ</h3>
        <div className="space-y-1">
          {ENTERPRISE_DOCS.map((cat) => {
            const isSelected = cat.id === activeCategory;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setActiveSectionId(cat.sections[0]?.id || '');
                }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition duration-150 flex items-center gap-2.5 ${
                  isSelected 
                    ? 'bg-indigo-50 border border-indigo-200 text-indigo-700 shadow-3xs' 
                    : 'text-slate-600 hover:text-slate-900 border border-transparent hover:bg-slate-50'
                }`}
                id={`btn-cat-${cat.id}`}
              >
                <div className={`p-1.5 rounded-lg border ${isSelected ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                  {renderCategoryIcon(cat.icon)}
                </div>
                <span>{cat.categoryName}</span>
              </button>
            );
          })}
        </div>

        {/* Section Sub-navigator */}
        {activeCategoryObj && (
          <div className="bg-slate-50 border border-slate-250 rounded-2xl p-4.5 space-y-2.5">
            <h4 className="text-[9px] font-bold font-mono text-slate-400 tracking-widest block uppercase">CẤU PHẦN CHI TIẾT</h4>
            <div className="space-y-1.5">
              {activeCategoryObj.sections.map((sect) => {
                const isActive = sect.id === activeSectionId;
                return (
                  <button
                    key={sect.id}
                    onClick={() => setActiveSectionId(sect.id)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                      isActive 
                        ? 'bg-white text-indigo-700 font-bold border border-slate-200 shadow-3xs' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    • {sect.title}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main Documentation Viewer Panel */}
      <div className="lg:col-span-9 space-y-6">
        {activeSection ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-3xs relative min-h-[500px]">
            {/* Action buttons */}
            <div className="absolute top-5 right-6 flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded uppercase hidden sm:inline">
                Syllabus GS6
              </span>
            </div>

            {/* Structured Content Viewer */}
            <div className="space-y-6 text-sm text-slate-700 leading-relaxed font-sans">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-mono text-indigo-600 uppercase font-bold tracking-widest block mb-0.5">HỒ SƠ QUY HOẠCH HỆ THỐNG</span>
                <h1 className="text-base font-extrabold text-slate-900 mt-1">{activeSection.title}</h1>
              </div>

              {/* Rendering markdown structures beautifully */}
              <div className="whitespace-pre-wrap font-sans space-y-4 text-xs font-semibold">
                {activeSection.content.split('\n\n').map((para, i) => {
                  if (para.startsWith('###')) {
                    return <h3 key={i} className="text-xs font-extrabold font-mono tracking-wider text-slate-800 uppercase pt-4 border-b border-slate-100 pb-2">{para.replace('###', '').trim()}</h3>;
                  }
                  if (para.startsWith('####')) {
                    return <h4 key={i} className="text-xs font-bold text-indigo-600 uppercase pt-2">{para.replace('####', '').trim()}</h4>;
                  }
                  if (para.startsWith('-')) {
                    return (
                      <ul key={i} className="list-disc list-inside pl-2 space-y-1 text-slate-600 font-sans">
                        {para.split('\n').map((li, j) => (
                          <li key={j} className="text-xs">{li.replace('-', '').trim()}</li>
                        ))}
                      </ul>
                    );
                  }
                  if (para.startsWith('|')) {
                    return (
                      <div key={i} className="overflow-x-auto my-3 border border-slate-200 rounded-xl">
                        <table className="min-w-full text-xs text-left text-slate-700 font-mono">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 font-bold">
                              <th className="px-4 py-2.5">Tác vụ / Thành phần</th>
                              <th className="px-4 py-2.5">ID / Mã</th>
                              <th className="px-5 py-2.5">Hành động</th>
                              <th className="px-4 py-2.5">Mô tả bổ trợ</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {para.split('\n').slice(2).map((row, rIdx) => {
                              const cells = row.split('|').filter(c => c.trim() !== '');
                              if (cells.length < 3) return null;
                              return (
                                <tr key={rIdx} className="hover:bg-slate-50/50">
                                  {cells.map((cell, cIdx) => (
                                    <td key={cIdx} className="px-4 py-2.5 whitespace-normal">{cell.trim()}</td>
                                  ))}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    );
                  }
                  if (para.startsWith("'''")) {
                    const cleanCode = para.replace(/'''(json|)/g, '').trim();
                    return (
                      <div key={i} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 p-4 font-mono text-[10.5px]">
                        <pre className="overflow-x-auto text-indigo-700 leading-normal">{cleanCode}</pre>
                      </div>
                    );
                  }
                  return <p key={i} className="text-xs text-slate-650 leading-relaxed font-sans">{para}</p>;
                })}
              </div>
            </div>
            
            {/* Live DB Table Explorer injected dynamically if viewing database segment */}
            {activeSectionId === 'erd_concept' && (
              <div className="mt-8 border-t border-slate-100 pt-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xs font-bold font-mono text-emerald-600 flex items-center gap-1.5 uppercase">
                      <Lucide.Search className="h-4 w-4" /> Tra cứu nhanh Thực thể CSDL (50+ Tables)
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Bấm tìm dòng bất kỳ trong cấu trúc cơ sở dữ liệu quan hệ.</p>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Tìm bảng nhanh..."
                      value={tableSearch}
                      onChange={(e) => setTableSearch(e.target.value)}
                      className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl px-3.5 py-1.5 outline-none font-sans w-48"
                      id="doc-tablesearch"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {filteredTables.slice(0, 8).map((tbl, idx) => (
                    <div key={idx} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-start gap-3">
                      <div className="text-emerald-700 bg-emerald-5 w-8 h-8 rounded-lg flex items-center justify-center border border-emerald-200 text-[10px] font-mono font-bold shrink-0">
                        tbl
                      </div>
                      <div>
                        <h4 className="text-xs font-bold font-mono text-slate-800">{tbl.name}</h4>
                        <p className="text-[10px] font-medium text-slate-505 leading-normal mt-1">{tbl.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {filteredTables.length > 8 && (
                  <p className="text-[10px] text-slate-400 text-center italic font-bold">+ Còn {filteredTables.length - 8} bảng chuyên sâu khác trong tệp thiết kế CSDL (Xem mô hình chi khoa học ở trên)...</p>
                )}
              </div>
            )}

            {/* Interactive API Sandbox injected dynamically if viewing API specification segment */}
            {activeCategory === 'api_spec' && (
              <div className="mt-8 border-t border-slate-100 pt-6 space-y-4">
                <h3 className="text-xs font-bold font-mono text-indigo-650 flex items-center gap-1.5 uppercase">
                  <Lucide.Cpu className="h-4 w-4 text-indigo-500 animate-pulse" /> Sandbox kiểm thử REST API Tương Tác
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Selectors and call action */}
                  <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold font-mono text-slate-450 uppercase block">Chọn Endpoint REST API</label>
                      <select 
                        value={apiSimulatorUrl}
                        onChange={(e) => {
                          setApiSimulatorUrl(e.target.value);
                          setMockResponseOutput('');
                        }}
                        className="w-full bg-white border border-slate-200 text-xs text-slate-800 font-mono p-2.5 rounded-lg outline-none cursor-pointer focus:border-indigo-500"
                      >
                        <option value="/api/v1/exams/sessions/start">POST /api/v1/exams/sessions/start</option>
                        <option value="/api/v1/auth/register">POST /api/v1/auth/register</option>
                        <option value="/api/ai/tutor">POST /api/ai/tutor</option>
                      </select>
                    </div>

                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Cơ chế giả lập tự sinh dữ liệu trả về theo chuẩn lược đồ OpenAPI Swagger tương thích môi trường Cloud Sandbox.</p>
                    <button
                      onClick={() => simulateApiCall(apiSimulatorUrl)}
                      className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm"
                    >
                      <Lucide.Send className="h-3.5 w-3.5" /> Gửi yêu cầu REST API
                    </button>
                  </div>

                  {/* Output display */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col min-h-36">
                    <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 border-b border-slate-200 pb-1.5 mb-2.5">
                      <span>KIỂM TRA ĐẦU RA PHẢN HỒI</span>
                      {mockResponseOutput && <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">HTTP 200 SUCCESS</span>}
                    </div>
                    {mockResponseOutput ? (
                      <pre className="text-[10.5px] font-mono text-emerald-700 whitespace-pre overflow-x-auto leading-tight bg-white p-3 rounded-lg border border-slate-150">{mockResponseOutput}</pre>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-mono italic my-auto text-center font-bold">Chưa có phản hồi. Nhấn nút Gửi yêu cầu để nhận phản hồi...</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 p-12 text-center rounded-2xl shadow-sm">
            <p className="text-slate-500 font-bold">Tài liệu không khả hoạt.</p>
          </div>
        )}
      </div>
    </div>
  );
}
