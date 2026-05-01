import { useState, useEffect, useRef } from "react";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMsg = { role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setLoading(true);

    if (window.innerWidth < 768) setIsSidebarOpen(false);

    try {
      // ✅ الحل النهائي: عبر Netlify function
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
        data?.output ||
        data?.text ||
        data?.message ||
        "نعتذر، لم أتمكن من العثور على إجابة دقيقة حالياً.";

      setMessages((prev) => [...prev, { role: "bot", text: reply }]);

    } catch (err) {
      console.error("Error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "حدث خطأ فني، يرجى التأكد من اتصالك بالإنترنت." },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-[#f8faf8] font-['Cairo']">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 right-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out border-l border-slate-100
        md:relative md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}
      `}>
        <div className="flex flex-col h-full p-6">

          <div className="flex flex-col items-center mt-6 mb-10">
            <div className="w-44 h-44 rounded-full border-4 border-[#1e5631]/10 p-2 shadow-inner bg-white overflow-hidden flex items-center justify-center">
              <img src="/OIP (1).webp" alt="Zuj Logo" className="w-full h-full object-contain" />
            </div>
            <h2 className="mt-4 font-black text-[#1e5631] text-sm">جامعة الزيتونة الأردنية</h2>
          </div>

          <button
            onClick={() => setMessages([])}
            className="w-full py-3.5 mb-10 rounded-2xl bg-[#1e5631] text-white font-bold"
          >
            + محادثة جديدة
          </button>

          <div className="mt-auto text-center text-xs text-slate-300">
            نظام المساعدة الأكاديمية © 2026
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col">

        {/* Header */}
        <header className="h-20 bg-[#1e5631] text-white flex items-center justify-between px-6">
          <h1 className="font-black text-xl">المساعد الأكاديمي</h1>
          <span className="text-xs">النظام نشط</span>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`p-4 rounded-2xl max-w-[70%] ${
                msg.role === "user"
                  ? "bg-[#1e5631] text-white"
                  : "bg-white border"
              }`}>
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="text-sm text-gray-400">جاري المعالجة...</div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <footer className="p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(inputValue);
            }}
            className="flex gap-2"
          >
            <input
              className="flex-1 p-3 rounded-xl border"
              placeholder="اكتبي سؤالك هنا..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button className="bg-[#1e5631] text-white px-4 rounded-xl">
              إرسال
            </button>
          </form>
        </footer>
      </main>
    </div>
  );
}