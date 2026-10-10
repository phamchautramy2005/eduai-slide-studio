# EduAI Slide Studio

Ứng dụng web chuyển kế hoạch bài dạy thành bộ slide PowerPoint 16:9, có xem trước, ghi chú thuyết trình và ba phong cách thiết kế.

## Chức năng
- Dán kế hoạch bài dạy hoặc tải lên tệp `.txt`.
- Tạo slide bằng OpenAI, yêu cầu bám sát kế hoạch gốc, không tự ý thêm kiến thức không có căn cứ.
- Chọn phong cách: hiện đại, sinh động, tối giản.
- Chọn số slide hoặc để AI đề xuất; chọn đối tượng học sinh/giáo viên.
- Xem trước từng slide và đọc ghi chú giảng dạy.
- Xuất PowerPoint `.pptx` có thể tiếp tục chỉnh sửa trong Microsoft PowerPoint/LibreOffice.
- Giao diện responsive trên máy tính và điện thoại.

## Chạy thử trên máy
1. Cài Node.js 20 trở lên.
2. Giải nén project, mở terminal tại thư mục này.
3. Chạy `npm install`.
4. Sao chép `.env.example` thành `.env.local`, điền `OPENAI_API_KEY` của bạn.
5. Chạy `npm run dev`, mở `http://localhost:3000`.

## Đưa lên link công khai bằng Vercel
1. Đẩy toàn bộ thư mục này lên một repository GitHub.
2. Đăng nhập Vercel, chọn **Add New → Project**, import repository.
3. Giữ framework preset Next.js và deploy.
4. Trong **Project → Settings → Environment Variables**, thêm `OPENAI_API_KEY` với API key của bạn (không đưa key vào mã nguồn).
5. Redeploy. Vercel sẽ cấp URL dạng `https://ten-du-an.vercel.app`.

## Lưu ý
- Cần API key OpenAI có quyền sử dụng API và có thể phát sinh chi phí theo mức sử dụng.
- Không nên nhập dữ liệu cá nhân nhạy cảm của học sinh.
- AI hỗ trợ biên soạn, không thay thế việc giáo viên rà soát kiến thức, yêu cầu chương trình và kế hoạch dạy học.
- Mã nguồn dùng API route phía server để không gửi API key đến trình duyệt.
