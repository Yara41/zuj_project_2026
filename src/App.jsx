import { useState, useEffect, useRef } from "react";
import { Trash2, Send, Plus, MessageSquare, ExternalLink, Globe, GraduationCap, ClipboardList, Bot, Layout, BookOpen, Layers, Repeat } from "lucide-react";

export default function App() {
  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem("zuj_advisor_chats");
    return saved ? JSON.parse(saved) : [{ id: Date.now(), title: "محادثة جديدة", messages: [] }];
  });
  
  const [activeChatId, setActiveChatId] = useState(chats[0].id);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];

  useEffect(() => {
    localStorage.setItem("zuj_advisor_chats", JSON.stringify(chats));
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    const newMessage = { role: "user", text };
    setChats(prev => prev.map(chat => 
      chat.id === activeChatId ? { ...chat, title: chat.messages.length === 0 ? text.substring(0, 25) : chat.title, messages: [...chat.messages, newMessage] } : chat
    ));
    setInputValue("");
    setLoading(true);

    try {
      const res = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, sessionId: activeChatId.toString() }),
      });
      const data = await res.json();
      setChats(prev => prev.map(chat => 
        chat.id === activeChatId ? { ...chat, messages: [...chat.messages, { role: "bot", text: data.output || "نعتذر، لم نتمكن من جلب الرد." }] } : chat
      ));
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-['Cairo'] text-right" dir="rtl">
      {/* SIDEBAR */}
      <aside className="w-80 bg-white border-l border-gray-200 flex flex-col shadow-sm hidden md:flex">
        <div className="p-6 flex flex-col items-center border-b border-gray-50">
          <div className="flex gap-4 mb-3">
             <img src="/OIP (1).webp" alt="ZUJ" className="h-16 w-auto" />
             <img src="/OIP (2).webp" alt="Faculty" className="h-16 w-auto" />
          </div>
          <h2 className="font-black text-[#1e5631] text-md">جامعة الزيتونة الأردنية</h2>
          <p className="text-[10px] text-gray-400 font-bold tracking-widest mt-1">QUALITY AND TRADITION</p>
        </div>

        <div className="p-4 flex-1 overflow-y-auto space-y-1">
          <button onClick={() => { const n = { id: Date.now(), title: "محادثة جديدة", messages: [] }; setChats([n, ...chats]); setActiveChatId(n.id); }} 
            className="w-full flex items-center justify-center gap-2 bg-[#1e5631] text-white p-3 rounded-xl font-bold hover:bg-[#163d25] transition-all mb-4">
            <Plus size={18} /> محادثة جديدة
          </button>
          
          {chats.map(chat => (
            <div key={chat.id} onClick={() => setActiveChatId(chat.id)} 
              className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${activeChatId === chat.id ? "bg-green-50 text-[#1e5631]" : "hover:bg-gray-50 text-gray-600"}`}>
              <div className="flex items-center gap-3 truncate">
                <MessageSquare size={16} className={activeChatId === chat.id ? "text-[#1e5631]" : "text-gray-400"} />
                <span className="text-sm font-bold truncate">{chat.title}</span>
              </div>
              <Trash2 size={14} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); setChats(chats.filter(c => c.id !== chat.id)); }} />
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50 space-y-2">
          <p className="text-[10px] font-black text-gray-400 px-2 mb-2">روابط سريعة</p>
          <a href="https://www.zuj.edu.jo/" target="_blank" className="flex items-center gap-2 p-2 bg-white rounded-lg text-xs font-bold text-gray-600 shadow-sm border border-gray-100 hover:border-green-200 transition-all"><Globe size={14} className="text-blue-500" /> موقع الجامعة</a>
          <a href="https://elearning.zuj.edu.jo/" target="_blank" className="flex items-center gap-2 p-2 bg-white rounded-lg text-xs font-bold text-gray-600 shadow-sm border border-gray-100 hover:border-green-200 transition-all"><GraduationCap size={14} className="text-green-600" /> التعلم الإلكتروني</a>
          <a href="https://exams.zuj.edu.jo" target="_blank" className="flex items-center gap-2 p-2 bg-white rounded-lg text-xs font-bold text-gray-600 shadow-sm border border-gray-100 hover:border-green-200 transition-all"><ClipboardList size={14} className="text-red-500" /> بوابة الامتحانات</a>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col relative">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center"><Bot size={22} className="text-[#1e5631]" /></div>
            <h1 className="font-black text-gray-800">المرشد الأكاديمي الذكي</h1>
          </div>
          <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
             <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
             <span className="text-[11px] font-bold text-gray-600">قسم نظم المعلومات الإدارية</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            {activeChat.messages.length === 0 ? (
              <div className="mt-10 animate-fade-in text-center">
                <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 mb-8">
                  <h2 className="text-2xl font-black text-gray-900 mb-4">أهلاً بكِ في كلية الأعمال</h2>
                  <p className="text-gray-500 font-medium mb-10">يمكنني مساعدتكِ في استخراج المعلومات من الخطة الدراسية وجداول الساعات</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button onClick={() => sendMessage("اعرض لي الخطة الدراسية")} className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-[#1e5631] transition-all group flex flex-col items-center">
                       <BookOpen className="text-blue-500 mb-3 group-hover:scale-110 transition-transform" />
                       <span className="text-sm font-bold text-gray-700">الخطة الدراسية</span>
                    </button>
                    <button onClick={() => sendMessage("ما هي مواد تخصصي؟")} className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-[#1e5631] transition-all group flex flex-col items-center">
                       <Layers className="text-green-500 mb-3 group-hover:scale-110 transition-transform" />
                       <span className="text-sm font-bold text-gray-700">مواد القسم</span>
                    </button>
                    <button onClick={() => sendMessage("كيف تتم معادلة المواد؟")} className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-[#1e5631] transition-all group flex flex-col items-center">
                       <Repeat className="text-orange-500 mb-3 group-hover:scale-110 transition-transform" />
                       <span className="text-sm font-bold text-gray-700">معادلة المواد</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              activeChat.messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} mb-6 animate-slide-up`}>
                  <div className={`p-4 md:p-5 rounded-2xl max-w-[85%] text-sm font-bold shadow-sm leading-relaxed ${
                    msg.role === "user" ? "bg-[#1e5631] text-white rounded-tr-none" : "bg-white border border-gray-100 text-gray-800 rounded-tl-none"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))
            )}
            {loading && <div className="text-xs font-bold text-[#1e5631] animate-pulse px-4 flex items-center gap-2"><Bot size={14}/> جاري مراجعة السجلات الأكاديمية...</div>}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <footer className="p-6 bg-transparent border-t border-gray-100">
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(inputValue); }} className="max-w-4xl mx-auto relative group">
            <input 
              className="w-full p-5 pr-14 rounded-[1.5rem] border-none bg-white shadow-xl focus:ring-2 focus:ring-[#1e5631] outline-none transition-all text-sm font-bold text-gray-700 placeholder:text-gray-300" 
              placeholder="اكتبي استفسارك عن المواد، الخطة، أو الساعات..." 
              value={inputValue} 
              onChange={(e) => setInputValue(e.target.value)} 
            />
            <button className="absolute left-3 top-1/2 -translate-y-1/2 bg-[#1e5631] text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-[#163d25] transition-all shadow-md">
              <Send size={18} className="rotate-180" />
            </button>
          </form>
          <p className="text-center text-[9px] text-gray-400 mt-4 font-bold">بناءً على بيانات قسم نظم المعلومات الإدارية - جامعة الزيتونة الأردنية</p>
        </footer>
      </main>
    </div>
  );
}