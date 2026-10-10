import pptxgen from "pptxgenjs";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
const palettes: Record<string, { bg: string; accent: string; text: string; muted: string; card: string }> = {
  modern: { bg: "F6F5FF", accent: "6857D9", text: "20213A", muted: "77768D", card: "FFFFFF" },
  playful: { bg: "FFF8ED", accent: "E57D43", text: "29263B", muted: "82776E", card: "FFFFFF" },
  minimal: { bg: "F5F7FA", accent: "287D78", text: "172B35", muted: "64747C", card: "FFFFFF" }
};
export async function POST(req: Request) {
  try {
    const { deck, style } = await req.json();
    if (!deck || !Array.isArray(deck.slides) || deck.slides.length === 0) return NextResponse.json({ error: "Không có slide để xuất." }, { status: 400 });
    if (deck.slides.length > 30) return NextResponse.json({ error: "Bộ slide vượt quá giới hạn 30 slide." }, { status: 400 });
    const p = new pptxgen();
    p.layout = "LAYOUT_WIDE";
    p.author = "EduAI Slide Studio"; p.subject = "Bài giảng được chuyển đổi từ kế hoạch bài dạy";
    p.title = deck.title || "Bài giảng"; p.company = "EduAI";
    p.theme = { headFontFace: "Aptos Display", bodyFontFace: "Aptos", lang: "vi-VN" };
    const c = palettes[style] || palettes.modern;
    const W = 13.333, H = 7.5;
    deck.slides.forEach((s: any, idx: number) => {
      const slide = p.addSlide();
      slide.background = { color: c.bg };
      slide.addShape(p.ShapeType.rect, { x: 0, y: 0, w: 0.16, h: H, line: { color: c.accent, transparency: 100 }, fill: { color: c.accent } });
      slide.addText("EDUAI  /  CLASSROOM", { x: 0.55, y: 0.28, w: 5.5, h: 0.25, fontFace: "Aptos", fontSize: 9, bold: true, charSpacing: 1.3, color: c.accent, margin: 0 });
      slide.addText(`${String(idx + 1).padStart(2, "0")}  /  ${String(deck.slides.length).padStart(2, "0")}`, { x: 11.4, y: 0.28, w: 1.25, h: 0.25, align: "right", fontSize: 9, color: c.muted, margin: 0 });
      slide.addShape(p.ShapeType.line, { x: 0.55, y: 0.72, w: 12.2, h: 0, line: { color: "DCD9EC", width: 0.8 } });
      slide.addText(String(s.title || "Nội dung bài học"), { x: 0.65, y: 1.02, w: 11.9, h: 0.78, fontFace: "Aptos Display", fontSize: idx === 0 ? 30 : 26, bold: true, color: c.text, breakLine: false, fit: "shrink", margin: 0.03, valign: "mid" });
      if (s.purpose) slide.addText(String(s.purpose), { x: 0.68, y: 1.88, w: 11.8, h: 0.42, fontSize: 12, color: c.muted, italic: true, fit: "shrink", margin: 0.02 });
      const bullets = Array.isArray(s.bullets) ? s.bullets.slice(0, 6) : [];
      const startY = s.purpose ? 2.48 : 2.25;
      const availableH = 4.35;
      const rowH = Math.min(0.9, availableH / Math.max(bullets.length, 1));
      bullets.forEach((b: string, i: number) => {
        const y = startY + i * rowH;
        slide.addShape(p.ShapeType.roundRect, { x: 0.72, y: y + 0.04, w: 11.9, h: rowH - 0.09, rectRadius: 0.08, line: { color: "E8E6F1", transparency: 25, width: 0.5 }, fill: { color: c.card } });
        slide.addShape(p.ShapeType.ellipse, { x: 0.96, y: y + Math.max(0.12, rowH / 2 - 0.09), w: 0.18, h: 0.18, line: { color: c.accent, transparency: 100 }, fill: { color: c.accent } });
        slide.addText(String(b), { x: 1.32, y: y + 0.08, w: 10.9, h: rowH - 0.16, fontFace: "Aptos", fontSize: 17, color: c.text, breakLine: false, fit: "shrink", valign: "mid", margin: 0.02, paraSpaceAfterPt: 3 });
      });
      slide.addText(String(deck.title || "Bài giảng"), { x: 0.68, y: 7.13, w: 10.8, h: 0.18, fontSize: 8, color: c.muted, margin: 0, fit: "shrink" });
      if (s.speakerNotes) slide.addNotes(String(s.speakerNotes));
    });
    const buffer = await p.write({ outputType: "nodebuffer" }) as Buffer;
    const safe = String(deck.title || "bai-giang").replace(/[^\p{L}\p{N}\-_ ]/gu, "").trim().replace(/\s+/g, "_").slice(0, 70) || "bai-giang";
    return new Response(buffer, { status: 200, headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(safe)}.pptx`,
      "Cache-Control": "no-store"
    }});
  } catch (e) {
    console.error("Export pptx error:", e);
    return NextResponse.json({ error: "Có lỗi khi tạo PowerPoint. Vui lòng thử lại." }, { status: 500 });
  }
}
