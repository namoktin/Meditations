# 🏛️ SUY TƯỞNG (MEDITATIONS) — WEB READER

Trang web đọc sách chuyên biệt được thiết kế để đọc dần và chiêm nghiệm từng chương trong bộ phân tích tác phẩm **Suy Tưởng (Meditations)** của **Marcus Aurelius** (bản dịch Gregory Hays 2002).

Toàn bộ ứng dụng web được lưu trữ tách biệt hoàn toàn trong thư mục `suytuong/web_reader/`, tuyệt đối **không làm thay đổi bất kỳ file dữ liệu gốc nào**.

---

## 🚀 HƯỚNG DẪN MỞ VÀ ĐỌC SÁCH

Bạn có thể dùng bất kỳ cách nào dưới đây:

### Cách 1 — Mở trực tiếp (Khuyên dùng, nhanh nhất, không cần cài đặt):
- Nhấp đúp chuột vào file **`mo_sach.bat`** hoặc file **`index.html`**.
- Web reader sẽ mở ngay trên trình duyệt mặc định của bạn (Chrome, Edge, Firefox, Brave,...).
- Hoạt động 100% offline, không cần kết nối internet hay chạy máy chủ.

### Cách 2 — Chạy qua máy chủ local (Đọc được trên cả Điện Thoại):
- Nhấp đúp chuột vào file **`chay_server.bat`**.
- Trên máy tính: truy cập `http://localhost:8080/`.
- Trên **điện thoại** (kết nối chung mạng Wi-Fi với máy tính): mở trình duyệt trên điện thoại và gõ địa chỉ:  
  👉 **`http://192.168.1.236:8080/`**  
  *(Địa chỉ IP mạng nội bộ của máy tính bạn)*

---

## ✨ CÁC TÍNH NĂNG NỔI BẬT DÀNH CHO NGƯỜI ĐỌC SÁCH

1. **Giao diện & Trải nghiệm Đọc (UI/UX):**
   - **4 Chế độ màu giấy:** 
     - 📜 *Giấy mộc (Sepia)*: Tông màu ấm cổ điển, dịu mắt nhất khi đọc lâu.
     - ☀️ *Sáng nhẹ (Soft Light)*: Trang giấy trắng ngà thanh lịch, hiện đại.
     - 🌙 *Đêm Khắc Kỷ (Stoic Night)*: Tông màu xám than sang trọng cho ban đêm.
     - 🌌 *OLED Đêm Sâu*: Nền đen tuyệt đối, tiết kiệm pin và đọc trong bóng tối.
   - **Tùy chỉnh typography linh hoạt:** Đổi kiểu font (Chữ sách Serif, Hiện đại Sans, Mono), tăng giảm cỡ chữ từ `14px` đến `26px`, điều chỉnh khoảng cách dòng và độ rộng trang giấy.
   - **Chế độ tập trung (Focus / Zen Mode):** Nhấn phím `F` hoặc nút mắt 👁️ để ẩn toàn bộ thanh công cụ và mục lục, chỉ giữ lại trang sách tinh khiết.

2. **Hỗ trợ Đọc Dần Các Chương (Reading Progress):**
   - **Theo dõi tiến độ:** Tự động lưu chương đang đọc dở và vị trí cuộn trang (scroll position), mở lại web là đọc tiếp ngay đoạn cũ.
   - **Đánh dấu hoàn thành:** Checkbox ☑ bên cạnh mỗi chương và nút *"Đánh dấu đã đọc"* ở cuối bài giúp theo dõi % toàn cuốn sách.
   - **Điều hướng mượt mà:** Nút *Chương trước / Chương sau* hiển thị xem trước tiêu đề chương kế tiếp.

3. **Chế Độ Xem Song Song (Dual-View):**
   - Đối với **12 Cuốn Sách (Book 1 đến Book 12)**: Cho phép chuyển đổi linh hoạt bằng một nút bấm giữa:
     - 🇻🇳 *Bản Phân Tích Chuyên Sâu* (Toàn bộ bài học, mô hình tư duy, bài tập thực hành).
     - 🏛️ *Văn Bản Gốc Tiếng Anh* (Bản dịch của Gregory Hays từ nguyên bản Hy Lạp cổ).

4. **Bộ 40 Flashcard Ôn Tập Khắc Kỷ Tương Tác:**
   - Chế độ lật thẻ 3D trực quan cho 40 thẻ ôn tập từ Phần VIII.
   - Lọc theo từng nhóm chủ đề (Khái niệm & Nền tảng, Quy tắc thực hành, Mô hình tư duy, Chiêm nghiệm vô thường).
   - Nút *"Đánh dấu đã thuộc"* và tính năng trộn thẻ ngẫu nhiên.

5. **Tìm Kiếm Toàn Diện (Full-text Search - Ctrl+K):**
   - Nhấn `Ctrl + K` hoặc bấm vào thanh tìm kiếm để tra cứu tức thì mọi khái niệm, trích dẫn, nguyên lý (ví dụ: *8.47, pháo đài, Amor Fati, Antoninus, chướng ngại*).
   - Bấm vào kết quả để nhảy thẳng đến chương và đoạn văn liên quan.

6. **Mục Lục Trang & Ghi Chú Chiêm Nghiệm Cá Nhân:**
   - Cột bên phải tự động sinh mục lục các đề mục H2/H3 trong chương để nhảy nhanh.
   - Ô ghi chú chiêm nghiệm ở chân cột phải giúp bạn lưu lại bài học và suy nghĩ riêng cho từng chương (lưu tự động vào trình duyệt).

---

## ⌨️ PHÍM TẮT TIỆN LỢI

| Phím tắt | Chức năng |
|----------|-----------|
| `Ctrl + K` hoặc `/` | Mở hộp thoại tìm kiếm nhanh |
| `[` hoặc `PageUp` | Chuyển về chương trước |
| `]` hoặc `PageDown` | Chuyển sang chương tiếp theo |
| `F` | Bật / Tắt chế độ tập trung (Focus Mode) |
| `B` | Đánh dấu / Bỏ dấu trang chương hiện tại |
| `Space` *(trong Flashcard)* | Lật mặt trước / mặt sau của thẻ |
| `←` / `→` *(trong Flashcard)* | Chuyển thẻ trước / sau |
| `Esc` | Đóng hộp thoại tìm kiếm, cài đặt hoặc thoát Focus Mode |

---

## 🛡️ ĐẢM BẢO TÍNH TOÀN VẸN CỦA DỮ LIỆU

- Toàn bộ 27 file tài liệu gốc trong `suytuong/` được giữ nguyên 100%, không bị sửa đổi hay ghi đè.
- Nếu bạn có chỉnh sửa hoặc bổ sung thêm nội dung vào các file markdown trong `suytuong/`, bạn chỉ cần chạy lệnh:
  ```bash
  python suytuong/web_reader/build_data.py
  ```
  File `book_data.js` sẽ được làm mới ngay lập tức mà vẫn bảo đảm toàn bộ nội dung gốc.
