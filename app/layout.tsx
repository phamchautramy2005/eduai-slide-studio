import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "EduAI Slide Studio — Trợ lý tạo slide bài giảng",
  description: "Chuyển kế hoạch bài dạy thành bộ slide PowerPoint bám sát mục tiêu và tiến trình dạy học."
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body>{children}</body></html>;
}
