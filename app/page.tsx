"use client";
import { useMemo, useState } from "react";

type Slide = { title: string; purpose?: string; bullets: string[]; speakerNotes?: string; layout?: string };
type Deck = { title: string; subject?: string; grade?: string; objectives?: string[]; slides: Slide[] };
const sample = `KẾ HOẠCH BÀI DẠY: QUANG HỢP Ở THỰC VẬT
Môn: Khoa học tự nhiên — Lớp 7
Thời lượng: 1 tiết (45 phút)

I. MỤC TIÊU
- Nêu được khái niệm quang hợp.
- Mô tả được vai trò của ánh sáng, nước, khí carbon dioxide và diệp lục.
- Giải thích được vai trò của quang hợp đối với sinh vật và môi trường.
- Hình thành năng lực quan sát, hợp tác và vận dụng kiến thức.

II. THIẾT BỊ DẠY HỌC
- Tranh/ảnh cây xanh, sơ đồ quá trình quang hợp; phiếu học tập.

III. TIẾN TRÌNH DẠY HỌC
1. Mở đầu (5 phút): Quan sát cây xanh, nêu câu hỏi cây lấy thức ăn từ đâu?
2. Hình thành kiến thức (20 phút): Tìm hiểu khái niệm, nguyên liệu, điều kiện và sản phẩm của quang hợp qua sơ đồ.
3. Luyện tập (10 phút): Học sinh hoàn thành sơ đồ và trả lời câu hỏi phân biệt nguyên liệu/sản phẩm.
4. Vận dụng (10 phút): Giải thích vì sao cần trồng và bảo vệ cây xanh; đề xuất việc làm tại gia đình.`;

export default function Home() {
  const [plan, setPlan] = useState("");
  const [style, setStyle] = useState("modern");
  const [count, setCount] = useState("auto");
  const [audience, setAudience] = useState("student");
  const [deck, setDeck] = useState<Deck | null>(null);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const slides = deck?.slides ?? [];
  const current = slides[active];
  const completion = useMemo(() => Math.min(100, Math.round((plan.trim().length / 900) * 100)), [plan]);

  async function generate() {
    setError(""); setNotice(""); setLoading(true);
    try {
      if (plan.trim().length < 50) throw new Error("Vui lòng nhập kế hoạch bài dạy đầy đủ hơn (ít nhất 50 ký tự).");
      const res = await fetch("/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, style, count, audience })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không tạo được slide. Vui lòng thử lại.");
      setDeck(data); setActive(0); setNotice(`Đã tạo ${data.slides.length} slide. Hãy rà soát nội dung trước khi xuất PowerPoint.`);
    } catch (e: any) { setError(e.message || "Có lỗi xảy ra."); }
    finally { setLoading(false); }
  }

  async function exportPptx() {
    if (!deck) return;
    setError(""); setNotice("");
    try {
      const res = await fetch("/api/export", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ deck, style }) });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || "Không xuất được PowerPoint."); }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url;
      a.download = `${(deck.title || "bai-giang").replace(/[^\p{L}\p{N}\-_ ]/gu, "").trim().replace(/\s+/g, "_")}.pptx`;
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
      setNotice("Đã xuất tệp PowerPoint (.pptx).");
    } catch (e: any) { setError(e.message || "Lỗi khi xuất tệp."); }
  }

  return <main>
    <header className="topbar">
      <a className="brand" href="#"><span className="brand-mark">E</span><span>EduAI <b>Slide Studio</b><small>TRỢ LÝ THIẾT KẾ BÀI GIẢNG</small></span></a>
      <div className="top-right"><span className="live-dot"></span> Không gian làm việc giáo viên <span className="avatar">GV</span></div>
    </header>
    <section className="hero">
      <div className="hero-copy">
        <div className="eyebrow"><span>✦</span> AI POWERED TEACHING TOOLS</div>
        <h1>Từ kế hoạch bài dạy<br/><em>đến slide truyền cảm hứng.</em></h1>
        <p>Biến kế hoạch bài dạy thành bộ trình chiếu mạch lạc, dễ dạy và dễ học — vẫn giữ đúng mục tiêu, kiến thức và tiến trình của thầy cô.</p>
        <div className="hero-points"><span>✓ Bám sát nội dung gốc</span><span>✓ Xuất PowerPoint</span><span>✓ Có ghi chú giảng dạy</span></div>
      </div>
      <div className="hero-art" aria-hidden="true">
        <div className="orbit orbit-one"></div><div className="orbit orbit-two"></div>
        <div className="floating-card card-a"><span className="mini-icon purple">✦</span><div><b>AI lesson design</b><small>Phân tích mục tiêu & tiến trình</small></div></div>
        <div className="slide-illustration"><div className="slide-head"></div><div className="slide-line long"></div><div className="slide-line"></div><div className="slide-content"><div className="slide-circle">✦</div><div><div className="slide-line"></div><div className="slide-line short"></div><div className="slide-line"></div></div></div><div className="slide-foot"><span></span><span></span><span></span></div></div>
        <div className="floating-card card-b"><span className="mini-icon green">✓</span><div><b>Ready to present</b><small>PowerPoint • 16:9</small></div></div>
      </div>
    </section>
    <section className="workspace">
      <div className="section-heading"><div><span className="step">01</span><h2>Thiết lập bài giảng</h2><p>Đưa kế hoạch bài dạy vào để AI chuyển thành cấu trúc slide.</p></div><span className="secure">◈ Nội dung do giáo viên kiểm soát</span></div>
      <div className="work-grid">
        <section className="panel input-panel">
          <div className="panel-title"><div className="panel-icon">▤</div><div><h3>Kế hoạch bài dạy</h3><p>Dán nội dung hoặc tải tệp .txt</p></div><span className="required">BẮT BUỘC</span></div>
          <div className="textarea-wrap"><textarea value={plan} onChange={e => setPlan(e.target.value)} placeholder="Dán kế hoạch bài dạy tại đây...&#10;&#10;Gợi ý: mục tiêu, thiết bị dạy học, tiến trình tổ chức hoạt động, nội dung kiến thức, câu hỏi đánh giá." aria-label="Kế hoạch bài dạy"/><div className="textarea-bottom"><span>{plan.length.toLocaleString("vi-VN")} ký tự</span><div className="meter"><span style={{width: `${completion}%`}}></span></div></div></div>
          <div className="file-row"><label className="upload-btn">＋ Tải tệp .txt<input type="file" accept=".txt,text/plain" onChange={async e => { const f = e.target.files?.[0]; if (f) setPlan(await f.text()); e.currentTarget.value = ""; }}/></label><button className="text-btn" onClick={() => setPlan(sample)}>Dùng nội dung mẫu ↗</button><button className="text-btn muted" onClick={() => {setPlan(""); setDeck(null); setError(""); setNotice("");}}>Xóa nội dung</button></div>
          <div className="form-divider"></div>
          <div className="option-heading"><h4>Tùy chỉnh bộ slide</h4><span>Không bắt buộc</span></div>
          <div className="field-grid">
            <label className="field"><span>Phong cách thiết kế</span><select value={style} onChange={e => setStyle(e.target.value)}><option value="modern">Hiện đại — chuyên nghiệp</option><option value="playful">Sinh động — thân thiện</option><option value="minimal">Tối giản — học thuật</option></select></label>
            <label className="field"><span>Số lượng slide</span><select value={count} onChange={e => setCount(e.target.value)}><option value="auto">AI đề xuất phù hợp</option><option value="6">6 slide — ngắn gọn</option><option value="8">8 slide — tiêu chuẩn</option><option value="10">10 slide — chi tiết</option><option value="12">12 slide — chuyên sâu</option></select></label>
          </div>
          <label className="field audience-field"><span>Đối tượng trình chiếu</span><div className="audience-options"><button className={audience === "student" ? "audience active" : "audience"} onClick={() => setAudience("student")}><span>◉</span><b>Học sinh</b><small>Trực quan, dễ hiểu</small></button><button className={audience === "teacher" ? "audience active" : "audience"} onClick={() => setAudience("teacher")}><span>▤</span><b>Giáo viên</b><small>Đủ ý, có ghi chú</small></button></div></label>
          {error && <div className="alert error">⚠ {error}</div>}{notice && <div className="alert success">✓ {notice}</div>}
          <button className="generate-btn" onClick={generate} disabled={loading}><span>{loading ? "◌" : "✦"}</span>{loading ? "Đang phân tích kế hoạch..." : "Tạo bộ slide bằng AI"}<span className="btn-arrow">→</span></button>
          <p className="privacy-note">✧ AI hỗ trợ biên soạn. Giáo viên cần rà soát tính chính xác trước khi sử dụng.</p>
        </section>
        <section className="panel preview-panel">
          <div className="panel-title preview-title"><div className="panel-icon lilac">▣</div><div><h3>Xem trước slide</h3><p>{deck ? `${slides.length} slide đã sẵn sàng` : "Bản xem trước sẽ hiển thị tại đây"}</p></div><span className="preview-badge">{deck ? "ĐÃ TẠO" : "LIVE PREVIEW"}</span></div>
          {deck && current ? <><div className={`slide-preview theme-${style}`}><div className="preview-top"><span>EDUAI <b>CLASSROOM</b></span><span>{String(active + 1).padStart(2,"0")} / {String(slides.length).padStart(2,"0")}</span></div><div className="preview-main"><span className="preview-kicker">{deck.subject || "BÀI GIẢNG"}{deck.grade ? ` • ${deck.grade}` : ""}</span><h2>{current.title}</h2>{current.purpose && <p className="slide-purpose">{current.purpose}</p>}<ul>{current.bullets.map((b,i)=><li key={i}><span>{String(i+1).padStart(2,"0")}</span>{b}</li>)}</ul></div><div className="preview-bottom"><span>{deck.title}</span><span>✦</span></div></div><div className="slide-controls"><button onClick={() => setActive(Math.max(0,active-1))} disabled={active===0}>←</button><div className="dots">{slides.map((s,i)=><button aria-label={`Slide ${i+1}`} key={i} className={i===active?"dot active":"dot"} onClick={()=>setActive(i)}></button>)}</div><button onClick={() => setActive(Math.min(slides.length-1,active+1))} disabled={active===slides.length-1}>→</button><span className="slide-number">Slide {active+1} / {slides.length}</span></div><div className="notes-box"><b>GỢI Ý GIẢNG DẠY</b><p>{current.speakerNotes || "Giáo viên bổ sung ghi chú phù hợp với lớp học."}</p></div><button className="export-btn" onClick={exportPptx}>⇩　Xuất PowerPoint (.pptx) <span>16:9</span></button></> : <div className="empty-preview"><div className="empty-icon"><div>✦</div><span></span><i></i></div><h3>Bài giảng của bạn sẽ xuất hiện ở đây</h3><p>AI sẽ sắp xếp nội dung thành từng slide, làm rõ ý chính và bổ sung ghi chú thuyết trình.</p><div className="preview-features"><span>▣ Cấu trúc rõ ràng</span><span>✧ Thiết kế nhất quán</span><span>⇩ Tệp .pptx</span></div></div>}
        </section>
      </div>
    </section>
    <section className="workflow"><div className="section-heading"><div><span className="step">02</span><h2>Quy trình làm việc</h2><p>Ba bước để có bộ trình chiếu sẵn sàng chỉnh sửa.</p></div></div><div className="workflow-grid"><div className="workflow-card"><span className="workflow-num">01</span><div className="workflow-icon">▤</div><h3>Nhập kế hoạch</h3><p>Dùng kế hoạch hiện có, bao gồm mục tiêu, hoạt động và đánh giá.</p></div><div className="workflow-card"><span className="workflow-num">02</span><div className="workflow-icon">✦</div><h3>AI cấu trúc slide</h3><p>Chia nội dung theo mạch dạy học, giữ nguyên trọng tâm kiến thức.</p></div><div className="workflow-card"><span className="workflow-num">03</span><div className="workflow-icon">⇩</div><h3>Rà soát & xuất tệp</h3><p>Xem trước, kiểm tra nội dung và tải PowerPoint để chỉnh sửa tiếp.</p></div></div></section>
    <footer><a className="brand footer-brand" href="#"><span className="brand-mark">E</span><span>EduAI <b>Slide Studio</b><small>TEACH SMARTER, INSPIRE MORE.</small></span></a><span>© 2026 EduAI Slide Studio · Công cụ hỗ trợ thiết kế bài giảng</span><span className="footer-status"><i></i> Sẵn sàng cho lớp học</span></footer>
  </main>;
}
