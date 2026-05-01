import { useState, useEffect, useRef } from "react";

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
        body: JSON.stringify({
          question: text,
          sessionId: "zuj_user_session",
        }),
      });

      const data = await res.json();

      const reply =
        typeof data === "string"
          ? data
          : data.output ||
            data.response ||
            data.answer ||
            (Array.isArray(data) && data[0]?.output) ||
            "نعتذر، لم أتمكن من العثور على إجابة دقيقة حالياً.";

      setMessages((prev) => [...prev, { role: "bot", text: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "حدث خطأ فني، يرجى التأكد من اتصالك بالإنترنت." },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-[#f8faf8] font-['Cairo']">
      {/* 1. SIDEBAR */}
      <aside className={`fixed inset-y-0 right-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out border-l border-slate-100 md:relative md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex flex-col h-full p-6">
          <div className="flex flex-col items-center mt-6 mb-10">
            <div className="w-44 h-44 rounded-full border-4 border-[#1e5631]/10 p-2 shadow-inner bg-white overflow-hidden flex items-center justify-center">
              <img src="/OIP (1).webp" alt="Zuj Logo" className="w-full h-full object-contain mix-blend-multiply" />
            </div>
            <div className="text-center mt-4">
              <h2 className="text-sm font-black text-[#1e5631]">جامعة الزيتونة الأردنية</h2>
              <span className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter">Academic Intelligence Unit</span>
            </div>
          </div>

          <button onClick={() => { setMessages([]); if (window.innerWidth < 768) setIsSidebarOpen(false); }} className="w-full py-3.5 px-4 mb-10 rounded-2xl bg-[#1e5631] text-white hover:bg-[#163d25] transition-all font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-900/10">
            <span>+</span> محادثة جديدة
          </button>

          <div className="space-y-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black px-2">بوابة الخدمات</p>
            <div className="grid gap-2">
              <a href="https://www.zuj.edu.jo/" target="_blank" rel="noreferrer" className="group flex items-center justify-between p-4 bg-slate-50 hover:bg-[#1e5631]/5 rounded-2xl transition-all">
                <span className="text-sm font-bold text-slate-600 group-hover:text-[#1e5631]">موقع الجامعة</span>
              </a>
              <a href="https://elearning.zuj.edu.jo/" target="_blank" rel="noreferrer" className="group flex items-center justify-between p-4 bg-slate-50 hover:bg-[#1e5631]/5 rounded-2xl transition-all">
                <span className="text-sm font-bold text-slate-600 group-hover:text-[#1e5631]">التعلم الإلكتروني</span>
              </a>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-gradient-to-r from-[#1e5631] to-[#2d7a45] text-white flex items-center justify-between px-6 md:px-10 shadow-xl z-30">
          <h1 className="font-black text-xl">المساعد الأكاديمي</h1>
        </header>

        {/* الرسائل أو الترحيب */}
        <div className="flex-1 overflow-y-auto p-4 md:p-10">
          {messages.length === 0 ? (
            /* الترحيب والبطاقات */
            <div className="flex flex-col items-center justify-center h-full text-center">
              <h1 className="text-3xl font-black text-[#1e5631] mb-8">كيف يمكنني مساعدتك اليوم؟</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                {["كيف تتم عملية الإرشاد الأكاديمي؟", "ما هي متطلبات التخرج؟", "كيف أسجل المواد؟"].map((q, idx) => (
                  <button key={idx} onClick={() => sendMessage(q)} className="p-4 bg-white border border-[#1e5631]/20 rounded-2xl hover:border-[#1e5631] hover:shadow-md transition-all text-sm font-bold text-slate-600">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* سجل المحادثة */
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`p-4 rounded-3xl ${msg.role === "user" ? "bg-[#1e5631] text-white" : "bg-white border"}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && <div className="text-center text-slate-400">جاري المعالجة...</div>}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* الإدخال */}
        <footer className="p-4 bg-white border-t">
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(inputValue); }} className="max-w-4xl mx-auto flex gap-2">
            <input className="flex-1 p-4 rounded-xl border" placeholder="اكتبي سؤالك هنا..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
            <button className="bg-[#1e5631] text-white px-6 rounded-xl font-bold">إرسال</button>
          </form>
        </footer>
      </main>
    </div>
  );
}