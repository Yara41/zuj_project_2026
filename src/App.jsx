import { useState, useEffect, useRef } from "react";

// تنظيف وتنسيق رد الروبوت
function cleanResponse(text) {
  if (!text) return "";
  text = text.replace(/^\s*\{\s*"output"\s*:\s*"/, "").replace(/"\s*\}\s*$/, "");
  text = text.replace(/^"output"\s*:\s*"/, "");
  text = text.replace(/^\s*\{/, "").replace(/\}\s*$/, "");
  text = text.replace(/\*\*(.*?)\*\*/g, "$1");
  text = text.replace(/##\s*/g, "");
  text = text.replace(/\*\s/g, "• ");
  text = text.replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\/g, "");
  return text.trim();
}

function FormattedMessage({ text }) {
  const cleaned = cleanResponse(text);
  const lines = cleaned.split("\n").filter(line => line.trim() !== "");
  return (
    <div className="space-y-1.5 text-right leading-relaxed">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (trimmed.endsWith(":") && trimmed.length < 50) {
          return <p key={i} className="font-bold text-[#1e5631] mt-3 first:mt-0">{trimmed}</p>;
        }
        if (/^[•\-\d]/.test(trimmed)) {
          return <p key={i} className="pr-3 text-slate-700">{trimmed}</p>;
        }
        return <p key={i} className="text-slate-700">{trimmed}</p>;
      })}
    </div>
  );
}

export default function App() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    const userMsg = { role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setLoading(true);
    if (window.innerWidth < 768) setIsSidebarOpen(false);

    try {
      const res = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, sessionId: "zuj_user_session" }),
      });
      const data = await res.json();
      let reply = data.output || "نعتذر، لم أتمكن من العثور على إجابة دقيقة حالياً.";
      setMessages((prev) => [...prev, { role: "bot", text: reply }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "bot", text: "حدث خطأ فني، يرجى التأكد من اتصالك بالإنترنت." }]);
    }
    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-[#f8faf8] font-['Cairo'] text-right" dir="rtl">
      {/* SIDEBAR - القائمة الجانبية */}
      <aside className={`fixed inset-y-0 right-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out border-l border-slate-100 md:relative md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex flex-col h-full p-6">
          <div className="flex flex-col items-center mt-6 mb-8">
            {/* اللوجوهات في السايدبار */}
            <div className="flex gap-2 mb-4">
                <img src="/OIP (1).webp" alt="Zuj Logo" className="w-16 h-16 object-contain border rounded-full p-1 shadow-sm" />
                <img src="/OIP (2).webp" alt="Business Logo" className="w-16 h-16 object-contain border rounded-full p-1 shadow-sm" />
            </div>
            <div className="text-center">
              <h2 className="text-sm font-black text-[#1e5631]">جامعة الزيتونة الأردنية</h2>
              <span className="text-[9px] text-slate-400 uppercase font-bold">Academic Intelligence Unit</span>
            </div>
          </div>

          <button onClick={() => setMessages([])} className="w-full py-3 px-4 mb-8 rounded-2xl bg-[#1e5631] text-white hover:bg-[#163d25] transition-all font-bold flex items-center justify-center gap-2 shadow-md">
            <span>+</span> محادثة جديدة
          </button>

          <div className="space-y-4">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black px-2">بوابة الخدمات</p>
            <div className="grid gap-2">
              <a href="https://www.zuj.edu.jo/" target="_blank" className="flex items-center justify-between p-3 bg-slate-50 hover:bg-green-50 rounded-xl transition-all group">
                <span className="text-sm font-bold text-slate-600 group-hover:text-green-700">موقع الجامعة</span>
                <span>🌐</span>
              </a>
              <a href="https://elearning.zuj.edu.jo/" target="_blank" className="flex items-center justify-between p-3 bg-slate-50 hover:bg-green-50 rounded-xl transition-all group">
                <span className="text-sm font-bold text-slate-600 group-hover:text-green-700">التعلم الإلكتروني</span>
                <span>🎓</span>
              </a>
              {/* الرابط الجديد بوابة الامتحانات */}
              <a href="https://exams.zuj.edu.jo" target="_blank" className="flex items-center justify-between p-3 bg-red-50/50 hover:bg-red-50 rounded-xl transition-all group border border-red-100">
                <span className="text-sm font-bold text-red-700">بوابة الامتحانات</span>
                <span>📝</span>
              </a>
            </div>
          </div>

          <div className="mt-auto pt-6 text-center border-t">
            <p className="text-[10px] text-slate-400">نظام المرشد الأكاديمي الذكي © 2026</p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT - المحتوى الأساسي */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-gradient-to-r from-[#1e5631] to-[#2d7a45] text-white flex items-center justify-between px-6 md:px-10 shadow-lg z-30">
          <div className="flex items-center gap-4">
            <h1 className="font-black text-xl tracking-tight">المرشد الأكاديمي | كلية الأعمال</h1>
          </div>
          <div className="flex items-center gap-3">
             <span className="hidden md:block text-xs opacity-80 italic">"الريادة والإبداع في الأعمال"</span>
             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden bg-white/20 p-2 rounded-lg">القائمة</button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-10">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center animate-fadeIn">
                <div className="max-w-2xl w-full bg-white rounded-3xl p-10 shadow-xl border border-slate-100">
                  <div className="w-20 h-20 bg-green-50 text-green-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm transform -rotate-3">
                    <span className="text-4xl">🤖</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-800 mb-3">مرحباً بك في منصة الإرشاد الذكي</h2>
                  <p className="text-slate-500 text-sm mb-8 leading-relaxed">أنا مرشدك الذكي، متواجد لمساعدتك في كل ما يخص تخصصك بملية الأعمال واللوائح الأكاديمية.</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {["كيف تتم عملية الإرشاد الأكاديمي؟", "ما هي شروط تسجيل مشروع التخرج؟", "الخطة الدراسية لكلية الأعمال", "كم الحد الأعلى للساعات في الفصل؟"].map((q, i) => (
                      <button key={i} onClick={() => sendMessage(q)} className="p-4 bg-slate-50 hover:bg-green-50 border border-slate-100 rounded-2xl transition-all text-right flex items-center justify-between group shadow-sm">
                        <span className="text-sm font-bold text-slate-700 group-hover:text-green-700">{q}</span>
                        <span className="text-green-600 opacity-0 group-hover:opacity-100 transition-all">←</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`p-4 rounded-2xl max-w-[80%] shadow-sm ${msg.role === "user" ? "bg-[#1e5631] text-white" : "bg-white border border-slate-200 text-slate-800"}`}>
                    {msg.role === "bot" ? <FormattedMessage text={msg.text} /> : msg.text}
                  </div>
                </div>
              ))
            )}
            {loading && <div className="flex justify-start"><div className="bg-white border p-4 rounded-2xl shadow-sm flex gap-1"><span className="animate-bounce">.</span><span className="animate-bounce delay-100">.</span><span className="animate-bounce delay-200">.</span></div></div>}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <footer className="p-6 bg-white border-t border-slate-100 shadow-2xl">
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(inputValue); }} className="max-w-4xl mx-auto flex gap-3">
            <input className="flex-1 p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-green-500 outline-none transition-all text-right shadow-inner" placeholder="اسأل مرشدك الأكاديمي..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
            <button className="bg-[#1e5631] text-white px-8 rounded-2xl hover:bg-[#163d25] transition-all font-bold shadow-md">إرسال</button>
          </form>
        </footer>
      </main>
    </div>
  );
}