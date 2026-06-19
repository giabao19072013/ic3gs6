export interface LessonTheory {
  lessonId: string;
  title: string;
  category: string;
  summary: string;
  keyConcepts: { term: string; definition: string }[];
  detailedContent: string; // Rich markdown-like detailed explanation
  shortcutsOrTables?: { key: string; action: string; description: string }[];
  reviewQuestions: { question: string; answer: string }[];
}

export const IC3_THEORY_DATA: Record<string, LessonTheory> = {
  cf_l1: {
    lessonId: "cf_l1",
    title: "Giới thiệu về Hệ sinh thái Máy tính (Phần cứng & Thiết bị)",
    category: "Computing Fundamentals",
    summary: "Tìm hiểu toàn diện về các bộ phận bên trong máy tính, bộ vi xử lý (CPU), các loại bộ nhớ (RAM, ROM, SSD/HDD), cổng kết nối vật lý và các thiết bị ngoại vi đầu vào/đầu ra.",
    keyConcepts: [
      { term: "CPU (Central Processing Unit)", definition: "Bộ vi xử lý trung tâm, đóng vai trò bộ não của máy tính, tính toán các phép toán logic và số học, và điều hành toàn bộ tác vụ của hệ thống." },
      { term: "RAM (Random Access Memory)", definition: "Bộ nhớ truy cập ngẫu nhiên, có tính chất 'khả biến' (volatile) - dữ liệu tạm thời chạy ứng dụng sẽ bị xóa sạch hoàn toàn khi tắt máy hoặc mất điện đột ngột." },
      { term: "ROM (Read-Only Memory)", definition: "Bộ nhớ chỉ đọc, không khả biến (non-volatile), lưu giữ mã khởi động cơ bản của hệ thống BIOS/UEFI. Dữ liệu không bị mất đi khi mất điện." },
      { term: "SSD (Solid State Drive)", definition: "Ổ cứng thể rắn sử dụng bộ nhớ Flash, cho tốc độ ghi/đọc dữ liệu cực cao và chống sốc vật lý tốt hơn nhiều so với cơ chế đĩa quay của HDD thông thường." }
    ],
    detailedContent: `
### I. Phân biệt Thiết bị Vào (Input) và Thiết bị Ra (Output)
Trong bài thi IC3 GS6, Certiport thường yêu cầu xác định chính xác tính chất của các thiết bị kết nối ngoại vi. Hãy ghi nhớ bảng phân loại dưới đây:
* **Thiết bị Đầu vào (Input Devices):** Bàn phím (Keyboard), Chuột (Mouse), Máy quét sinh trắc học (Scanner), Microphone, Webcam, Bảng vẽ đồ họa (Stylus/Digitizer), Cảm biến nhiệt.
* **Thiết bị Đầu ra (Output Devices):** Màn hình (Monitor/Display), Máy in (Printer), Loa (Speaker/Headphones), Máy chiếu (Projector).
* **Thiết bị Song hợp (Cả Vào và Ra):** Màn hình cảm ứng (Touchscreen), Kính thực tế ảo VR có tích hợp cảm biến, ổ cứng ngoài khi thao tác đọc/ghi.

### II. Các Phân Nhóm Cổng Kết Nối chuẩn Quốc tế
* **USB-A:** Hệ cổng kết nối truyền thống cho chuột, bàn phím, tốc độ thường từ USB 2.0 đến 3.0. Chỉ cắm được một chiều cố định.
* **USB-C:** Cổng kết nối thế hệ mới, thiết kế đối xứng (cắm hướng nào cũng được), hỗ trợ băng thông cực lớn cho cả truyền dữ liệu, xuất màn hình DisplayPort và sạc nhanh (Power Delivery).
* **HDMI & DisplayPort:** Các cổng chuyên dụng truyền tải tín hiệu âm thanh và hình ảnh số hóa chất lượng cao đến màn hình hoặc máy chiếu. DisplayPort thường có chốt khóa vật lý đặc trưng.
* **RJ-45 (Cổng Ethernet):** Sử dụng kết nối dây cáp mạng LAN, đảm bảo độ ổn định và bảo mật cao tuyệt đối so với Wi-Fi không dây.
    `,
    shortcutsOrTables: [
      { key: "Tần số xung nhịp CPU", action: "Đo bằng Hertz (GHz)", description: "Chỉ số biểu thị số lượng phép tính mà CPU có thể xử lý trong mỗi giây (ví dụ: 3.2 GHz là 3.2 tỷ phép tính/giây)." },
      { key: "Bus RAM", action: "Đo bằng MHz", description: "Tốc độ truyền dẫn dữ liệu của thanh RAM đến các linh kiện khác thông qua bo mạch chủ." },
      { key: "Bộ nhớ đệm (Cache)", action: "L1/L2/L3 Cache", description: "Bộ nhớ siêu nhanh nằm ngay trong lõi CPU, giúp lưu giữ dữ liệu lặp đi lặp lại để CPU không phải gọi từ RAM, tối ưu tốc độ xử lý." }
    ],
    reviewQuestions: [
      { question: "Điểm khác biệt cốt lõi nhất giữa RAM và ROM là gì?", answer: "RAM là bộ nhớ khả biến (mất dữ liệu khi mất điện) dùng để lưu dữ liệu tạm thời của phần mềm đang hoạt động. ROM là bộ nhớ không khả biến (giữ nguyên dữ liệu) lưu trữ mã phần sụn BIOS/UEFI để khởi động phần cứng máy tính." },
      { question: "Màn hình cảm ứng (Touchscreen) của máy tính bảng thuộc loại thiết bị nào?", answer: "Màn hình cảm ứng tích hợp cả khả năng hiển thị (Output) lẫn khả năng nhận cử chỉ ngón tay từ người dùng (Input), do đó nó có cả vai trò thiết bị Vào và thiết bị Ra song song." }
    ]
  },
  cf_l2: {
    lessonId: "cf_l2",
    title: "Hệ điều hành & Quản lý Tập tin hệ thống",
    category: "Computing Fundamentals",
    summary: "Nghiên cứu nguyên lý hoạt động của Hệ điều hành (Windows, macOS, Linux, ChromeOS), cách tổ chức tệp tin, đường dẫn tuyệt đối, thuộc tính tệp và hành vi sọt rác (Recycle Bin).",
    keyConcepts: [
      { term: "Hệ điều hành (Operating System)", definition: "Phần mềm hệ thống quản lý trực tiếp tài nguyên phần cứng, định phối CPU, RAM và lập môi trường nền để phần mềm ứng dụng khởi chạy." },
      { term: "Đường dẫn tuyệt đối (Absolute Path)", definition: "Đường dẫn xác định vị trí tệp tin từ gốc thư mục cao nhất của ổ đĩa (ví dụ: C:\\Users\\NguyenAn\\Documents\\report.docx)." },
      { term: "Thuộc tính tệp tin (File Attributes)", definition: "Các cờ thuộc tính gán cho tệp để kiểm soát truy cập bao gồm Read-Only (Chỉ đọc), Hidden (Ẩn), System (Hệ thống) và Archive (Lưu trữ)." },
      { term: "Recycle Bin (Sọt rác)", definition: "Khu vực lưu trữ tạm thời các tập tin đã bị người dùng xóa khỏi ổ đĩa mềm hoặc phân vùng HDD/SSD nội bộ của máy tính để đề phòng cứu dữ liệu." }
    ],
    detailedContent: `
### I. Các hệ điều hành phổ biến nhất hiện nay
* **Windows (Microsoft):** Phổ thông nhất toàn cầu, khả năng tương thích phần cứng và phần mềm văn phòng cực đại. Sử dụng hệ thống quản lý tệp NTFS.
* **macOS (Apple):** Hệ điều hành đóng dành riêng cho máy tính Mac, tối ưu hóa công việc đồ họa, sáng tạo nội dung nghệ thuật và tính bảo mật cao.
* **Linux:** Hệ điều hành mã nguồn mở, miễn phí, được giới lập trình viên và quản trị hệ thống máy chủ mạng tin tưởng cao nhờ tính ổn định và khả năng tùy biến sâu.
* **ChromeOS (Google):** Hệ điều hành gọn nhẹ, chạy nhanh trên các máy cấu hình thấp, chủ yếu xử lý tác vụ thông qua trình duyệt đám mây và ứng dụng Web.

### II. Quy tắc Xóa Tệp và Hành vi Thực Tế của Sọt rác (Recycle Bin)
Hành vi này được Certiport khảo sát rất kỹ trong IC3 GS6 và khiến nhiều người ôn luyện nhầm lẫn:
1. **Xóa tệp từ Ổ đĩa cứng trong (C:, D:):** Tệp tin được chuyển trực tiếp vào **Recycle Bin**. Người dùng có thể nhấn chuột phải để phục hồi danh tiếng (Restore) tệp về chỗ cũ.
2. **Xóa tệp từ Thiết bị ngoại vi ngoài (USB, Thẻ SD, ổ cứng mạng Shared Drive):** Tập tin sẽ bị **Xóa vĩnh viễn (Permanently Deleted)** trực tiếp lập tức mà KHÔNG đi qua Recycle Bin. Bạn không thể hồi phục tự nhiên bằng Windows nữa.
3. **Phím tắt Shift + Delete:** Cho dù tệp đó nằm ở ổ cứng trong, thao tác này cũng ra lệnh xóa vĩnh viễn tệp ngay mà không lưu trữ tạm vào Recycle Bin.
    `,
    shortcutsOrTables: [
      { key: "Windows + E", action: "Mở File Explorer", description: "Mở nhanh cửa sổ quản lý thư mục, tài nguyên ổ đĩa trên máy tính." },
      { key: "Alt + Tab", action: "Chuyển đổi cửa sổ", description: "Chuyển nhanh qua lại giữa các ứng dụng và tác vụ đang mở trên màn hình làm việc." },
      { key: "Windows + D", action: "Hiển thị màn hình Desktop", description: "Ẩn lập tức toàn bộ cửa sổ xuống thanh Taskbar để hiển thị màn hình nền Desktop sạch sẽ." }
    ],
    reviewQuestions: [
      { question: "Khi xóa một tệp tin dung lượng 10MB nằm trên USB cắm ngoài trong Windows 11, tôi có thể Restore nó từ Recycle Bin được không?", answer: "Không. Các tệp tin bị xóa từ các thiết bị nhớ di động tháo rời như USB, thẻ nhớ SD sẽ bị xóa vĩnh viễn ngay lập tức chứ không được giữ lại trong Recycle Bin." },
      { question: "Phần mở rộng tệp tin (File Extension) dùng để làm gì?", answer: "Dùng để báo cho Hệ điều hành biết định dạng của tệp và ứng dụng mặc định nào sẽ được dùng để khởi chạy tệp đó (ví dụ .xlsx cho Excel, .docx cho Word)." }
    ]
  },
  cf_l4: {
    lessonId: "cf_l4",
    title: "Quản lý thiết bị lưu trữ đám mây & Sao lưu (Backup)",
    category: "Computing Fundamentals",
    summary: "Phân tích các dịch vụ lưu trữ đám mây phổ biến (OneDrive, Google Drive, iCloud), nguyên tắc đồng bộ, chia sẻ liên kết phân quyền và quy trình sao lưu dữ liệu bảo mật.",
    keyConcepts: [
      { term: "Đám mây (Cloud Storage)", definition: "Dịch vụ lưu trữ dữ liệu tại máy chủ từ xa thông qua kết nối Internet, hỗ trợ truy cập dữ liệu mọi lúc mọi nơi từ bất kỳ thiết bị nào." },
      { term: "Đồng bộ hóa (Synchronization)", definition: "Tiến trình tự động cập nhật và giữ cho các tập tin ở máy tính cục bộ và máy chủ đám mây luôn trùng khớp, nhất quán về phiên bản mới nhất." },
      { term: "Sao lưu (Backup)", definition: "Tạo và lưu trữ các bản sao của dữ liệu gốc sang một nơi an toàn khác (như ổ cứng ngoài hay đám mây) để đề phòng mất mát dữ liệu do ransomware, hỏng ổ cứng." }
    ],
    detailedContent: `
### I. Các mô hình và dịch vụ lưu trữ đám mây thông dụng
* **Microsoft OneDrive:** Tích hợp trực tiếp sâu vào Windows 11 và bộ công cụ văn phòng Microsoft 365, tự động sao lưu các thư mục Desktop, Documents, Pictures.
* **Google Drive:** Liên kết chặt chẽ với hệ sinh thái Gmail, Android, Google Docs/Sheets, mang lại tính năng cộng tác trực tuyến nhiều người dùng cùng lúc mượt mà.
* **Apple iCloud:** Dịch vụ mặc định cho Mac, iPhone, iPad, sao lưu ảnh chụp, cấu hình máy và đồng bộ ghi chú liền mạch.

### II. Quản lý Quyền Truy Cập Khi Chia Sẻ Tài Liệu Đám Mây
Certiport yêu cầu hành viên nắm vững nguyên lý phân quyền chia sẻ liên kết trực tuyến:
1. **Quyền viewer (Người xem):** Chỉ được xem nội dung, không có quyền chỉnh sửa, sửa xóa tệp. Thường có thể cấu hình chặn tải xuống (Download block) hoặc in ấn.
2. **Quyền Commenter (Người bình luận):** Được xem và thêm các ghi chú, nhận xét bên lề tài liệu nhưng không thay đổi trực tiếp câu chữ của tài liệu gốc.
3. **Quyền Editor (Người chỉnh sửa):** Toàn quyền thay đổi nội dung, biểu đồ, cấu trúc thư mục, xóa tệp hoặc chuyển quyền sở hữu của các tệp chia sẻ nếu điều khoản cho phép.
    `,
    reviewQuestions: [
      { question: "Mất kết nối Internet có làm mất mát các tập tin đang đồng bộ dở trên OneDrive không?", answer: "Không. Các tập tin sẽ được giữ an toàn trên máy của bạn và hệ thống sẽ tự động tiến hành đồng bộ các tiến trình còn lại ngay khi máy tính của bạn khôi phục kết nối Internet." },
      { question: "Tại sao phương pháp sao lưu 3-2-1 lại là tiêu chuẩn vàng trong an toàn thông tin?", answer: "Bởi vì nó quy định lưu giữ tối thiểu 3 bản sao dữ liệu, trên 2 loại phương tiện lưu trữ vật lý khác nhau, và có 1 bản sao được lưu trữ ở một nơi địa lý hoàn toàn khác biệt (như lưu trữ đám mây) để phòng thảm họa vật lý cục bộ." }
    ]
  },
  ka_l1: {
    lessonId: "ka_l1",
    title: "Microsoft Word: Định dạng Bố cục, Thư viện & Header/Footer",
    category: "Key Applications",
    summary: "Hiệu chỉnh lề văn bản, phân chia phân vùng báo cáo (Section Breaks), chèn dấu bản quyền chìm (Watermark), tạo mục lục tự động và tùy chỉnh Header/Footer khác biệt giữa các chương.",
    keyConcepts: [
      { term: "Section Break (Ngắt phân vùng)", definition: "Dấu ngắt cho phép chia tài liệu thành nhiều vùng có định dạng, hướng giấy, viền trang hay đánh số Header/Footer hoàn toàn độc lập với nhau." },
      { term: "Watermark (Hình mờ bản quyền)", definition: "Văn bản hoặc hình ảnh mờ hiển thị chìm phía sau nội dung chính của trang giấy để khẳng định bản quyền tác giả hoặc đặt trạng thái tài liệu (Bản thảo, Tối mật)." },
      { term: "Margins (Căn lề)", definition: "Khoảng không cách giữa mép ngoài cùng của khổ giấy vật lý đến nội dung chữ hiển thị chính của đoạn văn (Top, Bottom, Left, Right)." }
    ],
    detailedContent: `
### I. Phân biệt Ngắt Trang (Page Break) và Ngắt Phân Vùng (Section Break)
Đây là câu hỏi then chốt trong kỹ năng sử dụng Microsoft Word của IC3 GS6:
* **Page Break (Ctrl + Enter):** Đổi dòng viết đẩy toàn bộ nội dung sau con trỏ sang trang giấy tiếp theo. Tuy nhiên, trang mới này **vẫn thuộc cùng một Section** và chịu chung cài đặt định dạng hướng giấy, kích thước lề của trang cũ.
* **Section Break (Layout > Breaks):** Tách tài liệu sang một vùng biệt lập hoàn toàn mới. Chỉ có Section Break mới cho phép bạn:
  - Trang 1 đặt hướng giấy Đứng (Portrait), Trang 2 đặt hướng giấy Ngang (Landscape).
  - Đánh số số trang bắt đầu từ số 1 tại Chương II, trong khi Lời mở đầu không đánh số trang.
  - Sử dụng Header/Footer khác nhau giữa các khu vực bằng cách ngắt tùy chọn **"Link to Previous"**.

### II. Các Bước Thiết Lập Mục Lục Tự Động (Table of Contents)
Để Microsoft Word tự động tổng hợp mục lục chuẩn xác, người viết phải thực hiện theo quy trình chặt chẽ:
1. Gán các tiêu đề, đề mục nội dung bằng các **Style** có sẵn là **Heading 1, Heading 2, Heading 3** từ thẻ Home.
2. Di chuyển con trỏ chuột đến vị trí trang trống muốn đặt mục lục.
3. Vào thẻ **References**, chọn mục **Table of Contents**, sau đó chọn một mẫu trình bày tự động (Automatic Table 1 hoặc 2).
4. Khi có sửa đổi nội dung trang, chọn **Update Table** và chọn "Update page numbers only" hoặc "Update entire table".
    `,
    shortcutsOrTables: [
      { key: "Ctrl + Enter", action: "Ngắt trang nhanh (Page Break)", description: "Đẩy nhanh nội dung xuống trang trực tiếp tiếp theo tức thì." },
      { key: "Ctrl + F9", action: "Chèn trường ẩn { } (Field Field Codes)", description: "Dùng để viết các trường mã động như tính toán hoặc đánh số chuyên sâu." },
      { key: "Alt + Shift + D", action: "Chèn ngày hiện tại tự động", description: "Chèn nhanh ngày tháng năm hiện giờ, tự động thay đổi giá trị theo thời điểm mở file." }
    ],
    reviewQuestions: [
      { question: "Làm thế nào để tạo trang bìa đầu tiên không hiển thị tiêu đề đầu trang còn các trang sau vẫn hiển thị Header bình thường trong Word?", answer: "Nháy đúp vào khu vực Header trên trang bìa đầu tiên để kích hoạt thẻ Header & Footer Tools, sau đó đánh dấu kiểm (tick) vào hộp chọn 'Different First Page' (Trang đầu tiên khác biệt) trên dải Ribbon." }
    ]
  },
  ka_l2: {
    lessonId: "ka_l2",
    title: "Microsoft Excel: Công thức & Địa chỉ Tuyệt đối VLOOKUP",
    category: "Key Applications",
    summary: "Làm chủ viết cú pháp tính toán Excel, giải nghĩa sâu các hàm SUM, AVERAGE, COUNT, IF, VLOOKUP, cách dùng phím F4 để khóa tuyệt đối địa chỉ ô để kéo công thức không lỗi.",
    keyConcepts: [
      { term: "Địa chỉ tương đối (Relative Reference)", definition: "Địa chỉ ô (ví dụ: A1) tự động thay đổi dòng và cột tương ứng khi chúng ta thực hiện kéo công thức sang ô khác." },
      { term: "Địa chỉ tuyệt đối (Absolute Reference)", definition: "Địa chỉ ô được cố định chặt chẽ cả dòng và cột bởi ký hiệu $ (ví dụ: $A$1), không bao giờ bị thay đổi khi sao chép công thức. Khóa bằng phím F4." },
      { term: "Hàm VLOOKUP", definition: "Hàm tìm kiếm một giá trị chỉ định tại cột đầu tiên bên trái của bảng dữ liệu tham chiếu, rồi trả về giá trị nằm cùng hàng từ cột chỉ định khác." }
    ],
    detailedContent: `
### I. Cú Pháp Hàm VLOOKUP và Giải Thích Chi Tiết Tham Số
Cú pháp chính thức: \`=VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])\`
Trong đó:
1. **lookup_value (Giá trị tìm kiếm):** Giá trị làm căn cứ mang đi tìm (ví dụ: Mã Nhân Viên nằm ở ô B2).
2. **table_array (Bảng tham chiếu):** Vùng bảng chứa thông tin đối chiếu cần tra cứu. **Bắt buộc phải bôi đen tuyệt đối và khóa bằng phím F4** (ví dụ: \`$G$2:$I$20\`) để khi copy công thức xuống dưới, bảng này không bị trượt dòng.
3. **col_index_num (Chỉ số cột):** Thứ tự của cột chứa giá trị muốn lấy ra từ bảng tham chiếu (tính từ trái sang phải của vùng table_array, bắt đầu từ cột số 1).
4. **range_lookup (Kiểu tìm kiếm):** 
   - Nhập **0 hoặc FALSE** để tìm kiếm **Chính xác (Exact match)**. Đây là kiểu dùng phổ biến nhất cho mã số, ID, tên riêng.
   - Nhập **1 hoặc TRUE** để tìm kiếm **Xấp xỉ (Approximate match)**. Thường dùng xếp loại điểm học lực hoặc tính mức thuế lũy tiến.

### II. Các Lỗi Tính Toán Thường Gặp và Nguyên Nhân
* **#N/A:** Không tìm thấy giá trị cần tra cứu trong dải tìm kiếm (thường gặp khi hàm VLOOKUP tìm giá trị nhập sai hoặc không có trong bảng).
* **#VALUE!:** Sai định dạng kiểu dữ liệu của tham số truyền vào (ví dụ: Lấy văn bản đem cộng trực tiếp với số học gốc).
* **#REF!:** Tham chiếu ô không hợp lệ (thường gặp khi xóa mất một cột hoặc dòng mà công thức khác đang liên kết tới, hoặc gõ col_index_num lớn hơn số cột hiện có của table_array trong hàm VLOOKUP).
* **#DIV/0!:** Lỗi thực hiện phép tính chia một số cho giá trị 0 hoặc chia cho ô trống rỗng.
    `,
    shortcutsOrTables: [
      { key: "F4 (trong thanh công thức)", action: "Chuyển loại địa chỉ ô", description: "Bấm 1 lần để khóa cả cột và dòng ($A$1), bấm 2 lần để chỉ khóa dòng (A$1), bấm 3 lần để chỉ khóa cột ($A1)." },
      { key: "Ctrl + T", action: "Chuyển vùng thành Bảng (Table)", description: "Tự động thiết lập định dạng bảng thông minh, có sẵn dải màu xen kẽ và bộ lọc dữ liệu tự động tại đầu cột." },
      { key: "Ctrl + Shift + L", action: "Bật / Tắt bộ lọc Excel nhanh", description: "Bật nhanh lưới lọc mũi tên tại hàng tiêu đề để lọc dữ liệu chỉ định." }
    ],
    reviewQuestions: [
      { question: "Công thức tại ô C2 là '=A2*$B$1'. Khi tôi kéo sao chép công thức này xuống ô C3, biểu thức tính toán ở ô C3 sẽ tự động biến đổi thành thế nào?", answer: "Tại ô C3, công thức sẽ biến đổi thành '=A3*$B$1'. Do ô A2 là tham chiếu tương đối nên tăng dòng lên A3, còn $B$1 là tham chiếu tuyệt đối nên giữ nguyên giá trị khóa." }
    ]
  },
  ka_l3: {
    lessonId: "ka_l3",
    title: "Microsoft Presentation: Slide Master, Transitions & Animations",
    category: "Key Applications",
    summary: "Hiểu sâu công cụ Slide Master định dạng hàng loạt slide nhanh gọn, phân biệt hiệu ứng Transitions và Animations, cách làm chủ Presenter View phục vụ thuyết trình chuyên nghiệp.",
    keyConcepts: [
      { term: "Slide Master (Bố cục gốc)", definition: "Slide đứng đầu trong cây sơ đồ bố cục điều khiển giao diện thiết kế, phông chữ chủ đạo, kích cỡ chữ và logo xuất hiện trên tất cả trang thuyết trình con tự động." },
      { term: "Transitions (Hiệu ứng chuyển trang)", definition: "Hiệu ứng hoạt động nghệ thuật xuất hiện ngay tại thời điểm chuyển đổi giữa Slide này sang Slide kia khi trình diễn." },
      { term: "Animations (Hiệu ứng thành phần)", definition: "Hiệu ứng chuyển động dành riêng cho các chi tiết cụ thể nằm bên trong lòng một slide như một khối chữ, hình ảnh, icon hoặc biểu đồ đồ họa." }
    ],
    detailedContent: `
### I. Sức Mạnh Khổng Lồ Của Slide Master
Khi muốn chèn ảnh logo của trường học hoặc đặt phông chữ Times New Roman áp dụng cho cả slide bài giảng 100 trang, một người bắt đầu có thể đi copy-paste từng slide. Tuy nhiên, cách làm chuẩn IC3 GS6 là sử dụng **Slide Master (View > Slide Master)**:
1. Khi chỉnh sửa trang Slide Master đầu tiên ở cấp độ cao nhất: mọi sự thay đổi về phông chữ, định dạng viên bullet, hoặc logo trường học chèn góc phải sẽ được cập nhật tự động lập tức áp dụng cho mọi layout con phía dưới.
2. Tiết kiệm tối đa thời gian, đảm bảo tính nhất quán thẩm mỹ thiết kế toàn vẹn của tệp slide tổng thể.
3. Người trình bày không thể vô ý dịch chuyển hoặc xóa các thành phần trang trí master khi đang soạn thảo văn bản thông thường ngoài chế độ đọc master.

### II. Làm chủ Presenter View (Vùng Trình Bày Riêng Tư)
Khi máy tính của bạn được kết nối với màn hình lớn hoặc máy chiếu, nhấn **Alt + F5** hoặc chọn "Use Presenter View" trong thẻ Slide Show mang lại giao diện kép đắt giá:
* **Màn hình Máy chiếu (Khách xem):** Chỉ nhìn thấy slide bài thuyết trình chính đang chạy full-screen.
* **Màn hình Laptop giáo viên (Người nói):** Nhìn thấy cực kỳ trực quan:
  - Slide hiện tại đang nói.
  - Slide kế tiếp sắp chiếu để chuẩn bị tâm lý nói dẫn dắt.
  - Vùng chữ viết **Notes (Slide Notes)** nhắc nhở nội dung giáo án phụ huynh.
  - Đồng hồ đếm thời gian trôi qua để kiểm soát giờ thuyết giảng.
    `,
    shortcutsOrTables: [
      { key: "F5", action: "Trình chiếu từ Slide đầu tiên", description: "Bắt đầu trình diễn bản thuyết trình từ trang đầu tiên trong tệp." },
      { key: "Shift + F5", action: "Trình chiếu từ Slide hiện tại", description: "Bắt đầu trình diễn trực tiếp ngay từ trang slide bạn đang chọn làm việc." },
      { key: "Phím B (khi đang chiếu)", action: "Làm đen màn hình (Black)", description: "Tạm thời làm đen màn hình chiếu để khán giả tập trung ánh nhìn vào người thuyết trình nói." }
    ],
    reviewQuestions: [
      { question: "Hãy nêu điểm khác nhau căn bản giữa hiệu ứng Transition và Animation?", answer: "Transition là hiệu ứng mỹ thuật xuất hiện khi chuyển tiếp giữa các slide với nhau trong quá trình trình chiếu. Animation là hiệu ứng chuyển động áp dụng riêng cho từng đối tượng chi tiết (như văn bản, hình vẽ, ảnh) nằm bên trong một slide cụ thể." }
    ]
  },
  lo_l2: {
    lessonId: "lo_l2",
    title: "Cẩm nang Bảo mật mạng, Firewall & Chống lừa đảo qua mạng",
    category: "Living Online",
    summary: "Nhận thức các mối đe dọa an ninh mạng nguy hiểm (Phishing, Trojan, Ransomware), cấu hình tường lửa ngăn chặn xâm nhập và quy trình thiết lập xác thực 2 bước (2FA/MFA) bảo mật an toàn tài khoản.",
    keyConcepts: [
      { term: "Phishing (Tấn công mạng giả mạo)", definition: "Hình thức lừa đảo gửi email hoặc thiết lập website giả mạo các thương hiệu uy tín (như ngân hàng, hòm thư của trường) dụ nạn nhân nhập mật khẩu, thông tin cá nhân." },
      { term: "Trojan Horse (Mã độc ẩn mình)", definition: "Phần mềm độc hại được ngụy trang hoàn hảo dưới vỏ bọc một ứng dụng hữu ích hoặc trò chơi miễn phí phổ thông để phá hoại hệ thống sau khi cài." },
      { term: "Firewall (Tường lửa)", definition: "Hệ thống bảo mật mạng kiểm soát trực tiếp các gói tin truyền tải ra/vào giữa mạng nội bộ máy tính và mạng Internet công cộng dựa trên quy tắc an ninh cho phép." },
      { term: "MFA / 2FA (Xác thực đa yếu tố)", definition: "Hệ thống yêu cầu người dùng chứng minh danh tính qua tối thiểu 2 lớp độc lập: thứ bạn biết (mật khẩu) và thứ bạn sở hữu (điện thoại nhận mã OTP)." }
    ],
    detailedContent: `
### I. Các dấu hiệu nhận diện cuộc tấn công giả mạo Phishing cực nhanh
Certiport cực kỳ ưu ái các tình huống ứng xử mạng thực tế. Khi nhận email từ trường học hoặc ngân hàng yêu cầu đổi mật khẩu khẩn cấp, học viên cần kiểm tra kỹ:
1. **Địa chỉ email người gửi (Sender Domain):** Email lừa đảo thường có tên hiển thị rất giống nhưng tên miền gốc lại cực kỳ lung tung (ví dụ: "ho-tro@hust.edu.vn" nhưng địa chỉ thực tế lại là "service@gmail-security-service993.com").
2. **Nội dung hăm dọa hoặc tạo cảm giác khẩn cấp giả tạo:** Yêu cầu đăng nhập ngay tức khắc trong 24 giờ nếu không muốn bị khóa tài khoản vĩnh viễn, đình chỉ thi học tập.
3. **Đường dẫn liên kết chứa ký tự lạ hoặc sai lỗi chính tả tối thiểu:** Sử dụng các dịch vụ rút ngắn link hoặc website giả mạo giao diện chính nhưng địa chỉ URL sai lệch.

### II. Toàn bộ Quy trình Quy chuẩn Kích hoạt Xác thực Hai Bước (MFA/2FA)
Trong đề thi IC3 GS6, quy trình cài đặt xác thực 2 bước thường xuất hiện dưới dạng câu hỏi thiết lập sắp xếp thứ tự thao tác chuẩn:
1. **Bước 1:** Tải xuống và cài đặt app **Authenticator** uy tín (như Google Authenticator hoặc Microsoft Authenticator) trên điện thoại di động cá nhân của bạn.
2. **Bước 2:** Đăng nhập vào trang tài khoản của bạn, tìm phần tùy chọn cấu hình **Security Settings (Cài đặt bảo mật)** và nhấp chọn kích hoạt tính năng **2-Step Verification** hoặc **Xác thực 2 yếu tố**.
3. **Bước 3:** Hệ thống trang web hiển thị một dải mã **QR Code** lớn, độc nhất vô nhị trên màn hình máy tính của bạn.
4. **Bước 4:** Mở ứng dụng Authenticator trên điện thoại của bạn, chọn chức năng **Add Account** và đưa camera điện thoại quét (Scan) dải mã QR Code kia.
5. **Bước 5:** Sinh ra một chuỗi mã OTP gồm 6 chữ số thay đổi sau mỗi 30 giây. Gõ ngược mã này vào ô xác nhận trên trang web để xác thực liên kết thành công. Tải xuống và cất giữ tệp **Backup Codes (Mã phục hồi dự phòng)** ở một khu vực an toàn khác.
    `,
    reviewQuestions: [
      { question: "Mục đích chính của việc kích hoạt Tường lửa (Firewall) trên máy tính chạy hệ điều hành Windows là gì?", answer: "Firewall có chức năng giám sát lưu lượng dữ liệu truy cập mạng, ngăn chặn các kết nối xâm nhập trái phép từ tin tặc bên ngoài hoặc chặn các phần mềm độc hại gửi thông tin đánh cắp ra mạng Internet." },
      { question: "Nếu tin tặc ăn cắp được mật khẩu đăng nhập Gmail của tôi, tại sao lớp bảo mật MFA vẫn có thể giữ cho tài khoản của tôi an toàn?", answer: "Vì tin tặc không sở hữu chiếc điện thoại vật lý của bạn đang giữ mã OTP 2FA ngẫu nhiên, phần xác thực bước 2 bị chặn lại không thể vượt qua, giúp bảo vệ tài khoản khỏi truy cập lén thành công." }
    ]
  }
};
