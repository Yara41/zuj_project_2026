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
    if(window.innerWidth < 768) setIsSidebarOpen(false);

    try {
      // تم تحديث الرابط ليعمل مع السيرفر الخارجي (Cloud) بدلاً من المحلي
      const res = await fetch("http://13.61.19.235:5678/webhook/b7ed42af-3773-4af7-a9d3-704e062369c8", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // نرسل النص تحت مفتاح chatInput ليتوافق مع الـ AI Agent
        body: JSON.stringify({ chatInput: text, sessionId: "zuj_user_session" }),
      });

      const data = await res.json();

      // 3. ملاحظة: تأكدي أن عقدة Respond to Webhook في n8n تُرجع قيمة باسم output
      const reply = data?.output || data?.text || data?.message || "نعتذر، لم أتمكن من العثور على إجابة دقيقة حالياً.";
      
      setMessages((prev) => [...prev, { role: "bot", text: reply }]);
    } catch (err) {
      console.error("Error:", err);
      setMessages((prev) => [...prev, { role: "bot", text: "حدث خطأ فني، يرجى التأكد من اتصالك بالإنترنت." }]);
    }
    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-[#f8faf8] font-['Cairo']">
      
      {/* 1. SIDEBAR - التصميم الدائري للوجو */}
      <aside className={`
        fixed inset-y-0 right-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out border-l border-slate-100
        md:relative md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}
      `}>
        <div className="flex flex-col h-full p-6">
          <div className="flex flex-col items-center mt-6 mb-10">
            {/* اللوجو بشكل دائري كبير وبدون حواف مربعة */}
            <div className="w-44 h-44 rounded-full border-4 border-[#1e5631]/10 p-2 shadow-inner bg-white overflow-hidden flex items-center justify-center">
              <img 
                src="/OIP (1).webp" 
                alt="Zuj Logo" 
                className="w-full h-full object-contain mix-blend-multiply" 
              />
            </div>
            <div className="text-center mt-4">
              <h2 className="text-sm font-black text-[#1e5631]">جامعة الزيتونة الأردنية</h2>
              <span className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter">Academic Intelligence Unit</span>
            </div>
          </div>

          <button 
            onClick={() => { setMessages([]); if(window.innerWidth < 768) setIsSidebarOpen(false); }}
            className="w-full py-3.5 px-4 mb-10 rounded-2xl bg-[#1e5631] text-white hover:bg-[#163d25] transition-all font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-900/10"
          >
            <span>+</span> محادثة جديدة
          </button>

          <div className="space-y-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black px-2">بوابة الخدمات</p>
            <div className="grid gap-2">
              <a href="https://www.zuj.edu.jo/" target="_blank" rel="noreferrer" className="group flex items-center justify-between p-4 bg-slate-50 hover:bg-[#1e5631]/5 rounded-2xl transition-all border border-transparent hover:border-[#1e5631]/20">
                <span className="text-sm font-bold text-slate-600 group-hover:text-[#1e5631]">موقع الجامعة</span>
                <span className="text-lg">🌐</span>
              </a>
              <a href="https://elearning.zuj.edu.jo/" target="_blank" rel="noreferrer" className="group flex items-center justify-between p-4 bg-slate-50 hover:bg-[#1e5631]/5 rounded-2xl transition-all border border-transparent hover:border-[#1e5631]/20">
                <span className="text-sm font-bold text-slate-600 group-hover:text-[#1e5631]">التعلم الإلكتروني</span>
                <span className="text-lg">🎓</span>
              </a>
            </div>
          </div>

          <div className="mt-auto pt-6 text-center border-t border-slate-50">
            <p className="text-[10px] text-slate-300 font-medium">نظام المساعدة الأكاديمية الذكي © 2026</p>
          </div>
        </div>
      </aside>

      {isSidebarOpen && (
        <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"></div>
      )}

      {/* 2. MAIN AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        <header className="h-20 bg-gradient-to-r from-[#1e5631] to-[#2d7a45] text-white flex items-center justify-between px-6 md:px-10 shadow-xl z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 hover:bg-white/10 rounded-lg">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16m-7 6h7"></path></svg>
            </button>
            <div className="hidden md:block">
              <h1 className="font-black text-xl tracking-tight leading-none">المساعد الأكاديمي</h1>
              <p className="text-[10px] text-green-200 mt-1 font-bold opacity-80 uppercase tracking-widest">Zuj Smart Concierge</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-black/20 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-md">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-[11px] font-black tracking-wider uppercase">النظام نشط</span>
          </div>
        </header>

        {/* MESSAGES AREA */}
        <div className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="max-w-4xl mx-auto text-right mt-10 md:mt-20">
              <div className="inline-block px-4 py-1.5 rounded-full bg-[#1e5631]/10 text-[#1e5631] text-[11px] font-black mb-6 animate-bounce">
                مرحباً بكِ في نظام الدعم الذكي
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-slate-800 mb-4 leading-tight">
                كيف يمكنني تسهيل <br/> <span className="text-[#1e5631]">رحلتك الأكاديمية</span> اليوم؟
              </h2>
              <p className="text-slate-400 mb-12 text-sm md:text-base font-medium max-w-xl">
                أنا هنا للإجابة على استفساراتك حول التسجيل، الخطط الدراسية، والأنظمة الجامعية بسرعة ودقة.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { title: "الإجراءات الأكاديمية", desc: "شروط التسجيل والساعات المسموحة", text: "كم عدد الساعات المسموح تسجيلها في الفصل؟" },
                  { title: "المسار الدراسي", desc: "الخطة الدراسية لتخصص ذكاء الأعمال", text: "ما هي الخطة الدراسية لتخصص ذكاء الأعمال؟" },
                  { title: "التخرج والتدريب", desc: "متطلبات التدريب ومشروع التخرج", text: "متى يمكنني تسجيل التدريب أو مشروع التخرج؟" },
                  { title: "الدعم الإرشادي", desc: "آلية التواصل مع المرشد الأكاديمي", text: "كيف تتم عملية الإرشاد الأكاديمي؟" }
                ].map((item, i) => (
                  <button 
                    key={i} 
                    onClick={() => sendMessage(item.text)}
                    className="p-6 bg-white border border-slate-100 rounded-[2rem] hover:shadow-xl hover:border-[#1e5631]/30 transition-all text-right group relative overflow-hidden active:scale-95 shadow-sm"
                  >
                    <h3 className="font-black text-slate-700 group-hover:text-[#1e5631] mb-1 transition-colors">{item.title}</h3>
                    <p className="text-[11px] text-slate-400 font-bold">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`p-4 md:p-5 rounded-3xl text-[13px] md:text-sm leading-relaxed max-w-[85%] md:max-w-[75%] shadow-sm ${
                    msg.role === "user" 
                    ? "bg-[#1e5631] text-white rounded-tl-none font-medium" 
                    : "bg-white border border-slate-100 text-slate-700 rounded-tr-none"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-100 p-5 rounded-3xl rounded-tr-none flex gap-1.5 shadow-sm">
                    <div className="w-2 h-2 bg-[#1e5631]/40 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-[#1e5631]/60 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 bg-[#1e5631] rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <footer className="p-4 md:p-8 bg-transparent">
          <form 
            onSubmit={(e) => { e.preventDefault(); sendMessage(inputValue); }}
            className="max-w-4xl mx-auto relative shadow-2xl rounded-[2rem]"
          >
            <input
              className="w-full py-4 md:py-6 pr-6 md:pr-8 pl-16 md:pl-20 rounded-[2rem] bg-white border-none focus:ring-4 focus:ring-[#1e5631]/5 transition-all text-sm md:text-base font-medium placeholder:text-slate-300"
              placeholder="اكتبي سؤالك هنا..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button 
              type="submit"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 bg-[#1e5631] text-white p-3 md:p-4 rounded-2xl hover:bg-[#163d25] transition-all shadow-lg active:scale-90"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </footer>
      </main>
    </div>
  );
}