import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "Chưa cấu hình OPENAI_API_KEY. Hãy thêm API key trong môi trường triển khai." }, { status: 500 });
    const { plan, style, count, audience } = await req.json();
    if (typeof plan !== "string" || plan.trim().length < 50) return NextResponse.json({ error: "Kế hoạch bài dạy quá ngắn hoặc chưa hợp lệ." }, { status: 400 });
    if (plan.length > 60000) return NextResponse.json({ error: "Nội dung quá dài (tối đa 60.000 ký tự). Hãy chia nhỏ kế hoạch." }, { status: 400 });
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const slideCount = count === "auto" ? "tự đề xuất số lượng hợp lý, thường 7–10" : count;
    const prompt = `Bạn là chuyên gia thiết kế bài giảng tại Việt Nam. Chuyển kế hoạch bài dạy dưới đây thành bộ slide PowerPoint bằng TIẾNG VIỆT.
NGUYÊN TẮC BẮT BUỘC:
- Bám sát tuyệt đối thông tin có trong kế hoạch. Không tự bịa dữ kiện, số liệu, trích dẫn, chuẩn đầu ra hay kiến thức cụ thể không có căn cứ.
- Giữ đúng mục tiêu, nội dung chuyên môn, trình tự hoạt động và thời lượng nếu được cung cấp. Không bỏ qua hoạt động dạy học quan trọng.
- Có thể diễn đạt cô đọng cho phù hợp slide; không làm sai nghĩa. Nếu thông tin nguồn mơ hồ, ghi rõ cần giáo viên xác nhận trong speakerNotes.
- Phân chia hợp lý: tiêu đề, mục tiêu/khởi động, kiến thức trọng tâm, hoạt động/luyện tập, vận dụng/đánh giá, kết luận tùy theo nội dung nguồn. Không ép mọi bài vào cùng một mẫu.
- Mỗi slide 3–5 gạch đầu dòng ngắn, không viết đoạn văn dài. Dùng ngôn ngữ phù hợp ${audience === "teacher" ? "giáo viên, có ghi chú tổ chức dạy học" : "học sinh, rõ ràng và dễ hiểu"}.
- Phong cách thiết kế: ${style}. Số lượng: ${slideCount} slide.
- speakerNotes là lời gợi ý cho người trình bày, không được thêm kiến thức mới không có trong nguồn.
- Chỉ trả về JSON hợp lệ, không markdown, theo schema: {"title":"...","subject":"...","grade":"...","objectives":["..."],"slides":[{"title":"...","purpose":"...","bullets":["..."],"speakerNotes":"...","layout":"content"}]}
KẾ HOẠCH BÀI DẠY GỐC:
${plan}`;
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Bạn chuyển kế hoạch bài dạy thành slide. Ưu tiên độ chính xác, trung thành với nguồn, không bịa. Chỉ xuất JSON hợp lệ." },
        { role: "user", content: prompt }
      ]
    });
    const raw = response.choices[0]?.message?.content;
    if (!raw) throw new Error("AI không trả về nội dung.");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.slides) || parsed.slides.length < 1) throw new Error("Cấu trúc slide trả về không hợp lệ.");
    parsed.slides = parsed.slides.map((s: any) => ({
      title: String(s.title || "Nội dung bài học").slice(0, 180),
      purpose: String(s.purpose || ""),
      bullets: Array.isArray(s.bullets) ? s.bullets.slice(0, 6).map((b: any) => String(b).slice(0, 400)) : [],
      speakerNotes: String(s.speakerNotes || ""),
      layout: String(s.layout || "content")
    }));
    return NextResponse.json({
      title: String(parsed.title || "Bài giảng"),
      subject: String(parsed.subject || ""),
      grade: String(parsed.grade || ""),
      objectives: Array.isArray(parsed.objectives) ? parsed.objectives.map(String) : [],
      slides: parsed.slides
    });
  } catch (e: any) {
    console.error("Generate slides error:", e);
    return NextResponse.json({ error: e?.message?.includes("API key") ? "API key chưa hợp lệ. Kiểm tra lại cấu hình." : "Không thể tạo slide lúc này. Kiểm tra API key/kết nối rồi thử lại." }, { status: 500 });
  }
}
