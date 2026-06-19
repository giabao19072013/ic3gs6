export interface DocSection {
  id: string;
  title: string;
  content: string;
}

export interface DocCategory {
  id: string;
  categoryName: string;
  icon: string; // lucide icon name
  sections: DocSection[];
}

export const ENTERPRISE_DOCS: DocCategory[] = [
  {
    id: 'vision_srs',
    categoryName: '1. Vision & SRS',
    icon: 'Compass',
    sections: [
      {
        id: 'vision_doc',
        title: 'Vision Document (Tài liệu Tầm nhìn)',
        content: `### TẦM NHÌN CHIẾN LƯỢC & HỆ THỐNG IC3 LMS ENTERPRISE

#### 1. Giới thiệu dự án (Executive Summary)
Dự án nhằm xây dựng một hệ thống Quản lý Học tập (LMS) tích hợp tính năng khảo thí/thi thử trực tuyến đạt chuẩn quốc tế dành riêng cho chứng chỉ IC3 GS6 (Internet and Computing Core Certification Global Standard 6). Nền tảng kết hợp tối ưu giữa ba mô hình cốt lõi:
- Hành trình Học tập: Video bài giảng, giáo trình PDF tương tác trực tiếp, học thuật ngữ qua Flashcard, luyện tập tác vụ độc lập.
- Khảo thí chuẩn hóa: Mô phỏng trung thực giao diện Certiport thực tế bao gồm toàn bộ các hình thức câu hỏi (Hotspot, Simulation, Drag-Drop, Matching).
- Trí tuệ nhân tạo (AI Engine): Hỏi đáp bài giảng thời gian thực với AI Tutor, phân tích dự báo kết quả thi thử qua AI Learning Analytics.

#### 2. Định vị Sản phẩm (Product Positioning)
- Tên dự án: IC3 Cloud Learning & Exam Center (IC3 LMS)
- Khách hàng mục tiêu: Trường học, Học viện đào tạo CNTT, Trung tâm tin học và học sinh tự ôn luyện tự do.
- Mục tiêu chiến lược: Đích đến là công cụ khảo thí tin học văn phòng hàng đầu Đông Nam Á, hỗ trợ tối đa việc nâng cao kỹ năng công nghệ số của thế hệ lao động trẻ.

#### 3. Mô tả Đối tượng Người dùng (Persona Definitions)
- Học sinh/Sinh viên (Student): Cần luyện đề sát đề thật, có AI sửa lỗi sai từng câu hỏi, theo dõi tiến độ và lộ trình tối ưu hóa điểm số.
- Giáo viên (Teacher): Quản lý tiến độ học tập của các lớp học từ xa, giao bài tự động theo chủ đề, xuất báo cáo điểm chi tiết để có phương án phụ đạo kịp thời.
- Quản lý trường học (School Admin): Giám sát hiệu suất giảng dạy của giáo viên, nắm bắt tỷ lệ thi đỗ của toàn bộ học sinh để đánh giá chất lượng đầu ra.
- Super Admin: Kiểm soát giấy phép (License), ngân hàng câu hỏi dùng chung, cấu hình bảo mật dữ liệu cấp doanh nghiệp.`
      },
      {
        id: 'srs_doc',
        title: 'Software Requirement Specification (SRS)',
        content: `### SOFTWARE REQUIREMENT SPECIFICATION (SRS) - CHI TIẾT KỸ THUẬT

#### 1. Yêu cầu Phi chức năng (Non-Functional Requirements)
- Hiệu năng (Performance):
  - Thời gian phản hồi API trung bình dưới 200ms.
  - Khả năng xử lý đồng thời (Concurrency) đạt tối thiểu 10,000 người dùng hoạt động đồng thời (active connections) tại thời điểm thi đỉnh điểm mà không gây lag/flicker màn hình làm bài nhờ vào mô hình clustering và Redis caching.
- Khả năng mở rộng (Scalability): Thiết kế Microservices hoàn chỉnh, cho phép scale riêng lẻ dịch vụ Khảo thí (Quiz service) và dịch vụ AI độc lập.
- Khả năng tương thích (Compatibility): Hoạt động mượt mà trên Chrome, Safari, Edge, Firefox, hỗ trợ Responsive đầy đủ tới màn hình di động tối thiểu 360px kích thước chiều rộng.
- Khả năng sẵn sàng (Availability): Cam kết thời gian uptime tối thiểu 99.9% (SLA) chạy trên Google Cloud Run đa vùng.

#### 2. Thống kê Chức năng cốt lõi (Core Functional Requirements)
- F-01: Hệ thống Đăng nhập & Đăng ký bảo mật: Hỗ trợ Multi-Tenant, SSO thông qua OAuth2 (Google, Microsoft, Facebook, Email truyền thống). Kèm MFA qua TOTP/Email OTP.
- F-02: Khảo thí Certiport-Mode: Fullscreen Mode chống chuyển vách màn hình (Anti-Cheat), tự động lưu trữ tiến độ (Auto-Save 30 giây), đếm ngược hạn giờ, phát hiện chuyển Tab (Tab Detection), copy/paste block.
- F-03: AI Copilot & Analytics: Trợ lý ảo AI túc trực giải nghĩa từng lỗi sai tương tác, vẽ biểu đồ dự đoán xác suất vượt qua bài thi Certiport thực tế.
- F-04: Giáo án Module hóa: Tách biệt 3 cấu phần chuẩn của IC3 GS6: Computing Fundamentals, Key Applications, Living Online.`
      }
    ]
  },
  {
    id: 'usecases_rules',
    categoryName: '2. Use Cases & Rules',
    icon: 'ListChecks',
    sections: [
      {
        id: 'usecases',
        title: 'Use Cases & Actors',
        content: `### DANH SÁCH USE CASES & TÁC NHÂN (ACTORS)

| Tác nhân (Actor) | Use Case ID | Tên Use Case | Mô tả chi tiết |
|---|---|---|---|
| Student | UC-01 | Đăng nhập SSO/MFA | Xác thực người dùng thông qua mã OTP an toàn |
| Student | UC-02 | Học bài giảng | Xem video, học flashcard, đọc PDF tài chính khóa |
| Student | UC-03 | Thi thử Certiport | Thực hành thi trong môi trường fullscreen, bấm giờ áp lực |
| Student | UC-04 | Hỏi đáp AI Tutor | Gửi đề bài nhờ AI phân tích gốc rễ lý thuyết và mẹo nhớ |
| Teacher | UC-05 | Tạo lớp & Quản lý | Thiết lập lớp học, quản lý danh sách học sinh theo mã Code |
| Teacher | UC-06 | Giao bài thi thử | Cấu hình thời gian mở/khóa, giao đề thi cho toàn bộ lớp học |
| Teacher | UC-07 | Chấm điểm tự luận | Chấm điểm nhanh và nhận xét học sinh tự động bằng AI đề xuất |
| School Admin | UC-08 | Thống kê chất lượng | Xuất báo cáo điểm trung bình, xếp thứ tự học sinh yếu để cải tiến |
| School Admin | UC-09 | Quản lý Nhân sự | Phân bổ quyền cho giáo viên chủ nhiệm từng phân ban học tập |
| Super Admin | UC-10 | Quản lý Câu hỏi | Biên tập nguồn câu hỏi, phân loại chuẩn hóa theo mục tiêu IC3 GS6 |`
      },
      {
        id: 'user_stories',
        title: 'User Stories (Cam kết người dùng)',
        content: `### USER STORIES & ĐIỀU KIỆN NGHIỆM THU (ACCEPTANCE CRITERIA)

#### 1. Dành cho Học sinh (Student)
- User Story: "Là một học sinh chuẩn bị bước vào kỳ thi IC3 GS6 quốc tế, tôi muốn thi thử trên một nền tảng giả lập chính xác giao diện của Certiport với các tác vụ kéo thả trực quan để tôi không bị bỡ ngỡ vào ngày thi thực tế."
- Điều kiện Nghiệm thu (Acceptance Criteria):
  - Màn hình thi giả lập có kích thước khu vực làm bài rộng rãi và layout chia đôi chuyên nghiệp: phía trên hoặc bên trái là hướng dẫn thao tác, phía dưới là nội dung câu hỏi.
  - Phải có nút 'Mark for Review' (Đánh dấu ôn tập) và thanh điều hướng phím tắt nhanh chuyển đổi giữa 45 câu hỏi.

#### 2. Dành cho Giáo viên (Teacher)
- User Story: "Là một giáo viên lớp tin học văn phòng đại trà, tôi muốn hệ thống tự động phát hiện và cảnh báo những học sinh có nguy cơ thi trượt (predicted at risk) dựa trên điểm thi thử, để tôi có thể gửi thư nhắc nhở ôn luyện thiết thực."
- Điều kiện Nghiệm thu (Acceptance Criteria):
  - Thuật toán AI Analytics dự đoán tỷ lệ đỗ của học sinh. Nếu tỷ lệ đỗ < 70%, hiển thị cờ đỏ "Cảnh báo nguy cơ cao (At Risk)" trong trang quản lý lớp học.`
      },
      {
        id: 'business_rules',
        title: 'Business Rules (Quy tắc Nghiệp vụ)',
        content: `### BUSINESS RULES (QUY TẮC NGHIỆP VỤ HỆ THỐNG)

- BR-1 (Quy tắc Tính điểm Certiport): Điểm số tối thiểu của bài thi thử IC3 là 100, tối đa là 1000 điểm. Học sinh đạt từ 700 điểm trở lên mới được hệ thống chứng nhận "ĐẠT (PASS)" và mở khóa các huy hiệu chiến thắng.
- BR-2 (Quy tắc Chống gian lận - Anti-Cheat):
  - Nếu học sinh chuyển Tab (tab focus out) quá 3 lần trong suốt tiến trình thi, bài thi sẽ tự động khóa lại, ghi nhận nộp bài hiển thị lý do "Vi phạm quy chế thi trực tuyến".
  - Chặn hoàn toàn phím Ctrl+C, Ctrl+V, chuột phải trong khu vực vùng làm bài thi.
- BR-3 (Quy tắc Gia hạn OTP): Mã OTP xác thực gửi qua Email hoặc SMS chỉ có hiệu lực tối đa trong 5 phút (300 giây). Sau khoảng thời gian này, mã cũ hết hiệu lực và người dùng phải yêu cầu sinh mã mới.
- BR-4 (Quy tắc Cắt khóa tự động): Ngân hàng câu hỏi khi tổ chức thi phải được xáo trộn ngẫu nhiên cả thứ tự câu hỏi (Random Questions) và thứ tự đáp án (Random Answers) để ngăn chặn việc học tủ, quay cóp giữa các học sinh cùng phòng máy.`
      }
    ]
  },
  {
    id: 'database',
    categoryName: '3. Database Design',
    icon: 'Database',
    sections: [
      {
        id: 'erd_concept',
        title: 'Sơ đồ ERD & Thiết kế Hệ thống 50+ Bảng',
        content: `### THIẾT KẾ CƠ SỞ DỮ LIỆU CHUYÊN SÂU (50+ TABLES ENTERPRISE-GRADE)

Hệ thống được thiết kế trên mô hình Cơ sở dữ liệu quan hệ hoàn chỉnh (Relational Database) hỗ trợ Multi-Tenant, Gamification, Khảo thí khắt khe, AI Analytics đầy đủ.

#### Các phân vùng bảng dữ liệu chính (Core Tables):

##### 1. Nhóm Bảng Xác thực và Người dùng (Auth & User Subsystem):
1. users [id, email, password_hash, full_name, role_id, avatar, birth_date, country, created_at, updated_at]
2. roles [id, role_name, description, permissions_mask]
3. user_profiles [id, user_id, school_name, grade_level, phone_number, major_subject]
4. user_mfa_settings [id, user_id, mfa_type, secret_key, is_enabled]
5. refresh_tokens [id, user_id, token, expires_at, created_at, is_revoked]
6. user_login_logs [id, user_id, ip_address, device_info, location, login_status, timestamp]

##### 2. Nhóm Bảng Gamification:
7. user_xp_history [id, user_id, xp_amount, trigger_type, description, timestamp]
8. badges [id, title, description, icon_name, rarity, criteria_json]
9. user_badges [id, user_id, badge_id, unlocked_at]
10. achievements [id, code, title, description, target_value, xp_reward]
11. user_achievements [id, user_id, achievement_id, current_value, is_completed, completed_at]
12. leaderboard_cache [id, user_id, score_type, total_xp, rank_position, updated_at]

##### 3. Nhóm Bảng Hệ thống Khóa học (LMS Modules):
13. modules [id, title, code, description, sequence, is_published]
14. lessons [id, module_id, title, lesson_type, sequence, xp_reward, media_url]
15. lesson_progress [id, user_id, lesson_id, is_completed, watch_duration_seconds, updated_at]
16. flashcards [id, lesson_id, front_text, back_text, image_url]
17. user_flashcard_reviews [id, user_id, flashcard_id, rating, next_review_at]
18. pdf_resources [id, lesson_id, file_path, file_size_mb, download_count]
19. assignments [id, class_id, title, description, due_date, max_score, created_by]
20. submissions [id, assignment_id, student_id, file_url, submitted_at, grade_score, feedback]

##### 4. Nhóm Ngân hàng Câu hỏi & Đề thi (Question Bank & Exam Hub):
21. questions [id, content_text, question_type, diff_level, recommended_time, category_id, explanation, creator_id]
22. question_options [id, question_id, option_label, option_text, is_correct, sequence]
23. question_hotspots [id, question_id, area_label, coord_x, coord_y, radius]
24. question_matching_pairs [id, question_id, left_value, right_value]
25. question_simulations [id, question_id, start_state_json, correct_action_sequence_json]
26. exams [id, title, desc_text, passing_score, time_limit_minutes, exam_type, is_active]
27. exam_questions [id, exam_id, question_id, question_order]
28. exam_sessions [id, user_id, exam_id, status, score, start_time, end_time, anticheat_violations_count]
29. exam_saves [id, session_id, last_saved_state_json, saved_at]
30. student_answers [id, session_id, question_id, given_answer_json, is_correct, taken_time_seconds]

##### 5. Nhóm Quản lý Lớp học (Classroom Management):
31. classes [id, teacher_id, class_name, invite_code, school_year, is_archived]
32. class_enrollments [id, class_id, student_id, enrolled_at]
33. class_announcements [id, class_id, title, content_text, created_at]
34. class_notification_settings [id, class_id, is_email_enabled, is_push_enabled]

##### 6. Nhóm AI & Analytics Engine:
35. ai_chat_sessions [id, user_id, title, created_at]
36. ai_chat_messages [id, session_id, sender_type, message_text, tokens_used, created_at]
37. ai_analytics_reports [id, student_id, predicted_pass_rate, summary_text, created_at]
38. ai_weakspots [id, report_id, topic_name, recommended_materials_json]

##### 7. Nhóm Báo cáo & Tài chính (Enterprise Billing & Logging):
39. tenant_contracts [id, tenant_name, license_type, active_until, school_quota]
40. billing_invoices [id, tenant_id, amount, payment_status, paid_at]
41. system_audit_logs [id, user_id, action_taken, target_table, ip_address, timestamp]
42. db_migration_history [id, version, migration_name, executed_at]
43. notification_queue [id, recipient_email, message_body, send_status, retry_count]
44. app_settings [id, setting_key, setting_value, environment_env]
45. user_feedbacks [id, user_id, category, message_body, is_resolved]
46. exam_cheat_logs [id, session_id, violation_type, detail_message, timestamp]
47. teacher_comments [id, student_id, teacher_id, comment_text, created_at]
48. video_analytics [id, user_id, video_lesson_id, completed_loops, last_paused_time]
49. api_rate_limits [id, ip_address, request_count, window_start]
50. oauth_identities [id, user_id, provider_name, provider_uid, token_data]`
      }
    ]
  },
  {
    id: 'api_spec',
    categoryName: '4. API Specification',
    icon: 'Code',
    sections: [
      {
        id: 'auth_endpoints',
        title: 'Authentication & Profile APIs',
        content: `### TÀI LIỆU REST API - XÁC THỰC & HỒ SƠ NGƯỜI DÙNG

#### 1. Đăng ký tài khoản (POST /api/v1/auth/register)
- Mô tả: Đăng ký tài khoản học viên/giáo viên mới.
- Request Body (JSON):
'''json
{
  "email": "student_test@hust.edu.vn",
  "password": "StrongPassword123!",
  "fullName": "Bùi Văn An",
  "role": "student",
  "schoolName": "Đại học Bách Khoa",
  "gradeClass": "K68-TinHoc",
  "country": "Vietnam"
}
'''
- Response Success (201 Created):
'''json
{
  "success": true,
  "message": "Đăng ký thành công. Vui lòng xác thực mã OTP gửi tới email của bạn.",
  "userId": "usr_9921",
  "otpSent": true
}
'''

#### 2. Kích hoạt Xác thực 2 lớp (POST /api/v1/auth/mfa/enable)
- Mô tả: Thiết lập khóa bảo mật 2-Factor Authentication thông qua ứng dụng Sinh mã số OTP.
- Headers: Authorization: Bearer JWT_ACCESS_TOKEN
- Response Success (200 OK):
'''json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCodeDataUrl": "data:image/png;base64,...",
  "message": "Vui lòng quét mã QR này và xác nhận mã 6 số để kích hoạt hoàn toàn MFA"
}
'''`
      },
      {
        id: 'exam_endpoints',
        title: 'Khảo thí & Ngân hàng câu hỏi APIs',
        content: `### TÀI LIỆU API - QUẢN LÝ QUẦN THỂ ĐỀ THI & KHẢO THÍ

#### 1. Khởi tạo phiên thi thử (POST /api/v1/exams/sessions/start)
- Mô tả: Học sinh bắt đầu một bài thi thử Certiport. Hệ thống tự động xáo trộn và snapshot đề thi.
- Request Body:
'''json
{
  "examId": "exam_cf_gs6_01",
  "mode": "simulation" 
}
'''
- Response (200 OK):
'''json
{
  "sessionId": "sess_88291a",
  "timeLimitSeconds": 2700,
  "questions": [
    {
      "id": "q_01",
      "type": "MULTIPLE_CHOICE",
      "questionText": "Khi bạn xóa một tập tin trên thẻ nhớ USB...",
      "options": ["Option A", "Option B", "Option C", "Option D"]
    }
  ]
}
'''

#### 2. Auto-Save tiến độ thi thử (POST /api/v1/exams/sessions/save)
- Mô tả: Định kỳ 30 giây lưu trữ trạng thái chọn đáp án để đề phòng sự cố mất điện, mất mạng WiFi đột ngột.
- Request Body (JSON):
'''json
{
  "sessionId": "sess_88291a",
  "answers": {
    "q_01": "Option A",
    "q_02": "Đúng"
  }
}
'''
- Response (200 OK):
'''json
{
  "success": true,
  "lastSavedAt": "2026-06-18T14:20:10Z"
}
'''`
      },
      {
        id: 'ai_endpoints',
        title: 'AI Tutor & Analytics APIs',
        content: `### TÀI LIỆU API - AI INTEGRATION SERVICES

#### 1. Hỏi đáp chuyên sâu với AI Tutor (POST /api/ai/tutor)
- Mô tả: Học sinh gửi câu hỏi tin học khó nhờ AI giải thích tường tận.
- Request Body:
'''json
{
  "questionText": "Bản chất của mạng WAN và LAN khác nhau thế nào?",
  "userAnswer": "LAN có diện bao phủ rộng hơn WAN",
  "correctAnswer": "WAN kết nối diện rộng toàn cầu, LAN nội bộ phạm vi hẹp",
  "explanation": "WAN là Wide Area Network kết nối các bang, quốc gia...",
  "query": "Tại sao tôi hay nhầm lẫn giữa mạng LAN và mạng WAN?"
}
'''
- Response Success (200 OK):
'''json
{
  "success": true,
  "mode": "live",
  "text": "### Phân tích từ AI Tutor... LAN là Local Area Network, gói gọn trong tòa nhà văn phòng..."
}
'''

#### 2. Phân tích tiến độ học tập thông minh (POST /api/ai/analytics)
- Mô tả: Dự báo tỉ lệ đỗ thi thật của học sinh dựa trên lịch sử thi thử.
- Request Body:
'''json
{
  "examHistory": [
    { "examId": "M1", "score": 820 },
    { "examId": "M2", "score": 690 }
  ],
  "name": "Nguyễn Hoàng Nam"
}
'''
- Response (200 OK):
'''json
{
  "predictedPassRate": 85,
  "weaknesses": ["Giao thức bảo mật TCP/IP", "Xử lý hàm tài chính PMT Excel"],
  "roadmap": [
    { "phase": "Chặng 1", "actions": "Đọc lại tài liệu IP address" }
  ]
}
'''`
      }
    ]
  },
  {
    id: 'architecture_security',
    categoryName: '5. Architectures',
    icon: 'ShieldAlert',
    sections: [
      {
        id: 'system_arch',
        title: 'System Architecture (Kiến trúc Hệ thống)',
        content: `### KIẾN TRÚC HỆ THỐNG ENTERPRISE (SYSTEM ARCHITECTURE)

Hệ thống được vận hành theo kiến trúc Full-Stack đám mây tối tân kết hợp Docker Container hóa.

#### 1. Mô tả luồng dữ liệu (Data Flow):
1. Client Tier: Trình duyệt phía người dùng chạy ứng dụng React SPA và điều hành giao diện thi.
2. Gateway / Proxy Tier: Nginx Reverse Proxy tiếp nhận dữ liệu định tuyến qua SSL hóa. Chịu trách nhiệm Load Balancing và chặn lọc DDoS cơ bản.
3. Application Tier: Node.js Express Server xử lý API chính, xác thực JWT, tương tác với các Microservices phụ trợ.
4. AI Processing: Gởi kết nối API Server-side đến Google GenAI API bằng giao thức gRPC tốc độ cao, giữ bảo mật tuyệt đối cho api key.
5. Database Tier:
   - PostgreSQL (Cloud SQL): Lưu trữ quan hệ thực tế, bảo đảm tính nhất quán dữ liệu ACID.
   - Redis Cache: Lưu trữ phiên thi thời gian thực và thông tin xếp hạng huy hiệu XP để tránh thắt cổ chai I/O đĩa cứng.

#### 2. Biểu đồ Phân tán (Distribution Topology):
'''
+------------------+     SSL / HTTPS     +--------------------+
|   Browser User   |  ================>  | Nginx Load Balancer|
+------------------+                     +--------------------+
                                                   ||
                                   +---------------+---------------+
                                   |                               |
                                   v                               v
                        +--------------------+          +--------------------+
                        | Node.js Express 1  |          | Node.js Express 2  |
                        +--------------------+          +--------------------+
                                   ||                              ||
                    +--------------+--------------+  +-------------+--------------+
                    |                             |  |                            |
                    v                             v  v                            v
            +---------------+              +--------------+               +---------------+
            |  Cloud SQL    |              |  Redis Cache |               | Google GenAI  |
            | (PostgreSQL)  |              |  (Session)   |               |   API Node    |
            +---------------+              +--------------+               +---------------+
'''`
      },
      {
        id: 'security_arch',
        title: 'Security Architecture (Kiến trúc Bảo mật)',
        content: `### THIẾT KẾ KIẾN TRÚC BẢO MẬT (SECURITY ARCHITECTURE)

Nền tảng bảo vệ đa tầng đạt tiêu chuẩn phần mềm Giáo dục quốc tế:

- JWT Security Model: Access Token thời gian sống ngắn (15 phút) lưu trong bộ nhớ máy trạm, Refresh Token thời gian sống dài (7 ngày) khóa chặt trong cookie chỉ đọc (HttpOnly, Secure, SameSite=Strict) để tiệt trừ tấn công XSS chiếm dụng token.
- Chống lỗi khóa SQL Injection: Sử dụng triệt để thư viện ORM tham số hóa toàn vẹn các câu truy vấn. Không bao giờ cộng chuỗi SQL thô từ input.
- XSS & CSRF Mitigation: Cài đặt bộ lọc tiêu đề Content-Security-Policy (CSP) khắt khe trên Nginx. Sử dụng token chống CSRF trùng khớp cho toàn bộ các yêu cầu sửa đổi thông số viết lên DB.
- Encryption Algorithm: Bản mã hóa chuẩn bcrypt (mật độ xử lý salt = 12) xử lý mật khẩu nguyên bản của người dùng trước khi lưu trữ vào bảng users. Dữ liệu nhạy cảm trên đường truyền thực thi TLS 1.3 chặt chẽ.`
      }
    ]
  },
  {
    id: 'timeline_roadmap',
    categoryName: '6. Roadmap & Costs',
    icon: 'TrendingUp',
    sections: [
      {
        id: 'roadmap_plan',
        title: 'Product Roadmap (Lộ trình phát triển)',
        content: `### LỘ TRÌNH PHÁT TRIỂN SẢN PHẨM (PRODUCT ROADMAP - 1 LỚP DOANH NGHIỆP)

#### Quý 1: Khởi động & Xây dựng Cấu trúc nền tảng (Foundation)
- [x] Định hình kiến trúc Docker hóa, thiết lập ERD 50+ tables và Base REST API.
- [x] Hoàn thiện cổng học tập số: Video bài giảng, Giáo trình tương tác, Flashcards của 3 Modules tin học cốt lõi.

#### Quý 2: Engine Khảo thí & Chống Gian lận (Certiport-Mode Simulation)
- [ ] Tích hợp tính năng Fullscreen, phát hiện chuyển tab thông minh, tự động lưu trữ nộp bài cưỡng chế.
- [ ] Hoàn thành 100% ngân hàng câu hỏi đầy đủ các dạng Hotspot, Matching, Simulation phức tạp.

#### Quý 3: Trí tuệ nhân tạo (AI Integration & Analytics)
- [ ] Phát hành Trợ lý AI Tutor giải thích bài thi, đề lỗi.
- [ ] Chạy thực nghiệm Mô hình dự đoán khả năng đỗ để xếp nhóm học tập chủ động.

#### Quý 4: Enterprise Scale & Multi-Tenant Deployment
- [ ] Mở rộng cổng dành cho Trường học và cơ chế tự phân phối License.
- [ ] Quốc tế hóa ngôn ngữ (Tiếng Anh, Tiếng Việt, Tiếng Tây Ban Nha).`
      },
      {
        id: 'cost_estimation',
        title: 'Cost Estimation & Budget',
        content: `### DỰ TOÁN CHI PHÍ PHÁT TRIỂN & VẬN HÀNH DỰ ÁN (COST ESTIMATION)

#### 1. Chi phí Nhân tài phát triển (R&D Human Resources) - 6 tháng đầu:
- 1 Project Manager / Scout Master: $3,000/tháng x 6 = $18,000
- 2 Senior Fullstack Engineers: $3,500/tháng x 2 x 6 = $42,000
- 1 UI/UX Designer: $2,000/tháng x 6 = $12,000
- 1 QA Automation Specialist: $1,800/tháng x 6 = $10,800
- Tổng nhân lực R&D: $82,800 (~1.98 Tỷ VND)

#### 2. Chi phí Hạ tầng Đám mây (Google Cloud Platform Server Node) - Hàng tháng:
- Google Cloud Run (Web App & API Container services): $150/tháng
- Cloud SQL PostgreSQL (Developer/Highly Available Engine Area): $120/tháng
- Memorystore Redis Core Cache: $40/tháng
- Google GenAI API (Gemini-3.5-flash Tokens usage quota): $300/tháng (Cho khoảng 100,000 phản hồi chi tiết mỗi tháng)
- Tổng vận hành Cloud Base hàng tháng: $610/tháng (~14.6 Triệu VND)`
      },
      {
        id: 'testing_deployment',
        title: 'Testing & DevOps Deployment Plan',
        content: `### KẾ HOẠCH KIỂM THỬ (TEST PLAN) & VẬN HÀNH DEVOPS

#### 1. Kế hoạch Kiểm thử toàn diện (Testing Strategy):
- Unit Testing: Triển khai Jest/Vitest cho bộ lõi logic tính toán điểm số thi thử, bảo đảm tỷ lệ phủ mã nguồn (code coverage) luôn lớn hơn 85%.
- Integration Testing: Kiểm thử liên kết luồng nộp bài thi thử, đảm bảo câu trả lời gửi lên từ Client được ghi nhận chính xác trong bảng student_answers.
- Stress & Load Testing: Sử dụng công cụ K6 hoặc Apache JMeter mô phỏng 10,000 truy cập nộp bài đồng thời trong vòng 5 phút để đo lường độ chịu tải của hệ thống.

#### 2. Kế hoạch Vách ngăn Triển khai (CI/CD DevOps Blue-Green):
- GitHub Actions pipeline:
  - Sự kiện push/pull request: Tự động chạy linters kiểm tra cú pháp và UnitTest.
  - Sự kiện merge vào branch main: Kích hoạt build Docker image, đẩy hình ảnh (Push) lên Google Artifact Registry mới.
- Blue-Green Deployments: Hệ thống cập nhật phiên bản mới thông qua cơ chế Zero-Downtime của Cloud Run bằng cách điều lượng lưu lượng mạng (traffic split) chạy thử nghiệm 5% trên bọc máy mới (Canary/Green) trước khi mở rộng lên 100% khi không phát hiện thấy lỗi.`
      }
    ]
  }
];
