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
        {
          role: "bot",
          text: "حدث خطأ فني، يرجى التأكد من اتصالك بالإنترنت.",
        },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-[#f8faf8] font-['Cairo']">
      {/* 1. SIDEBAR */}
      <aside
        className={`
        fixed inset-y-0 right-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out border-r border-slate-100
        md:relative md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }
      `}
      >
        <div className="flex flex-col h-full p-6">
          <div className="flex flex-col items-center mt-6 mb-10">
            <div className="w-44 h-44 rounded-full border-4 border-[#1e5631]/10 p-2 shadow-inner bg-white overflow-hidden flex items-center justify-center">
              <img
                src="/OIP (1).webp"
                alt="Zuj Logo"
                className="w-full h-full object-contain mix-blend-multiply"
              />
            </div>
            <div className="text-center mt-4">
              <h2 className="text-sm font-black text-[#1e5631]">
                جامعة الزيتونة الأردنية
              </h2>
              <span className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter">
                Academic Intelligence Unit
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              setMessages([]);
              if (window.innerWidth < 768) setIsSidebarOpen(false);
            }}
            className="w-full py-3.5 px-4 mb-10 rounded-2xl bg-[#1e5631] text-white hover:bg-[#163d25] transition-all font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-900/10"
          >
            <span>+</span> محادثة جديدة
          </button>

          <div className="space-y-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black px-2">
              بوابة الخدمات
            </p>
            <div className="grid gap-2">
              <a
                href="https://www.zuj.edu.jo/"
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between p-4 bg-slate-50 hover:bg-[#1e5631]/5 rounded-2xl transition-all"
              >
                <span className="text-sm font-bold text-slate-600 group-hover:text-[#1e5631]">
                  موقع الجامعة
                </span>
                <span>🌐</span>
              </a>

              <a
                href="https://elearning.zuj.edu.jo/"
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between p-4 bg-slate-50 hover:bg-[#1e5631]/5 rounded-2xl transition-all"
              >
                <span className="text-sm font-bold text-slate-600 group-hover:text-[#1e5631]">
                  التعلم الإلكتروني
                </span>
                <span>🎓</span>
              </a>
            </div>
          </div>

          <div className="mt-auto pt-6 text-center border-t border-slate-50">
            <p className="text-[10px] text-slate-300 font-medium">
              نظام المساعدة الأكاديمية الذكي © 2026
            </p>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-gradient-to-r from-[#1e5631] to-[#2d7a45] text-white flex items-center justify-between px-6 md:px-10 shadow-xl z-30">
          <h1 className="font-black text-xl">المساعد الأكاديمي</h1>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden bg-white/20 px-3 py-1.5 rounded-lg text-xs font-bold"
          >
            القائمة
          </button>
        </header>

        {/* الرسائل والترحيب */}
        <div className="flex-1 overflow-y-auto p-4 md:p-10">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* عرض شاشة الترحيب والبطاقات في حال عدم وجود رسائل */}
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center animate-fadeIn">
                <div className="max-w-2xl w-full bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-slate-100/80">
                  <div className="w-16 h-16 bg-[#1e5631]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl">
                    🎓
                  </div>
                  <h2 className="text-2xl font-black text-[#1e5631] mb-3">
                    أهلاً بك في المساعد الأكاديمي لجامعة الزيتونة
                  </h2>
                  <p className="text-slate-500 text-sm max-w-md mx-auto mb-8 leading-relaxed">
                    أنا المساعد الذكي، مستعد للإجابة على جميع استفساراتك الأكاديمية والإرشادية. تفضل بطرح سؤالك!
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right max-w-xl mx-auto">
                    <button
                      onClick={() => sendMessage("كيف تتم عملية الإرشاد الأكاديمي؟")}
                      className="group p-4 bg-slate-50 hover:bg-[#1e5631]/5 border border-slate-100 rounded-2xl transition-all text-right flex items-center justify-between shadow-sm cursor-pointer"
                    >
                      <span className="text-sm font-bold text-slate-700 group-hover:text-[#1e5631]">
                        كيف تتم عملية الإرشاد الأكاديمي؟
                      </span>
                      <span className="text-[#1e5631] opacity-0 group-hover:opacity-100 transition-all">
                        ➔
                      </span>
                    </button>
                    <button
                      onClick={() => sendMessage("ما هي شروط التسجيل في الجامعة؟")}
                      className="group p-4 bg-slate-50 hover:bg-[#1e5631]/5 border border-slate-100 rounded-2xl transition-all text-right flex items-center justify-between shadow-sm cursor-pointer"
                    >
                      <span className="text-sm font-bold text-slate-700 group-hover:text-[#1e5631]">
                        ما هي شروط التسجيل؟
                      </span>
                      <span className="text-[#1e5631] opacity-0 group-hover:opacity-100 transition-all">
                        ➔
                      </span>
                    </button>
                    <button
                      onClick={() => sendMessage("مواعيد الامتحانات")}
                      className="group p-4 bg-slate-50 hover:bg-[#1e5631]/5 border border-slate-100 rounded-2xl transition-all text-right flex items-center justify-between shadow-sm cursor-pointer"
                    >
                      <span className="text-sm font-bold text-slate-700 group-hover:text-[#1e5631]">
                        مواعيد الامتحانات
                      </span>
                      <span className="text-[#1e5631] opacity-0 group-hover:opacity-100 transition-all">
                        ➔
                      </span>
                    </button>
                    <button
                      onClick={() => sendMessage("الخطة الدراسية")}
                      className="group p-4 bg-slate-50 hover:bg-[#1e5631]/5 border border-slate-100 rounded-2xl transition-all text-right flex items-center justify-between shadow-sm cursor-pointer"
                    >
                      <span className="text-sm font-bold text-slate-700 group-hover:text-[#1e5631]">
                        الخطة الدراسية
                      </span>
                      <span className="text-[#1e5631] opacity-0 group-hover:opacity-100 transition-all">
                        ➔
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`p-4 rounded-3xl max-w-xl shadow-sm ${
                      msg.role === "user"
                        ? "bg-[#1e5631] text-white"
                        : "bg-white border text-slate-800"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))
            )}

            {/* حالة الانتظار */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border text-slate-500 p-4 rounded-3xl shadow-sm">
                  جاري المعالجة...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* 3. الإدخال */}
        <footer className="p-4 bg-white border-t border-slate-100">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(inputValue);
            }}
            className="max-w-4xl mx-auto flex gap-2"
          >
            <input
              className="flex-1 p-4 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#1e5631] transition-all"
              placeholder="اكتبي سؤالك هنا..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button className="bg-[#1e5631] text-white px-6 rounded-2xl hover:bg-[#163d25] transition-all font-bold">
              إرسال
            </button>
          </form>
        </footer>
      </main>
    </div>
  );
}