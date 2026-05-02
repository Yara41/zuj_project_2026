import { useState, useEffect, useRef } from "react";
import { Trash2, Send, Plus, MessageSquare, ExternalLink, Globe, GraduationCap, ClipboardList, Bot, Layout, Menu, X } from "lucide-react";

export default function App() {
  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem("zuj_advisor_chats");
    return saved ? JSON.parse(saved) : [{ id: Date.now(), title: "محادثة جديدة", messages: [] }];
  });
  
  const [activeChatId, setActiveChatId] = useState(chats[0].id);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // إضافة حالة القائمة للجوال
  const messagesEndRef = useRef(null);

  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];

  useEffect(() => {
    localStorage.setItem("zuj_advisor_chats", JSON.stringify(chats));
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  const formatResponse = (text) => {
    try {
      const parsed = JSON.parse(text);
      return parsed.output || text;
    } catch (e) { return text; }
  };

  const createNewChat = () => {
    const newChat = { id: Date.now(), title: "محادثة جديدة", messages: [] };
    setChats([newChat, ...chats]);
    setActiveChatId(newChat.id);
    setIsMobileMenuOpen(false); // إغلاق القائمة بعد إنشاء محادثة في الجوال
  };

  const deleteChat = (id, e) => {
    e.stopPropagation();
    const filtered = chats.filter(c => c.id !== id);
    if (filtered.length === 0) {
      const reset = [{ id: Date.now(), title: "محادثة جديدة", messages: [] }];
      setChats(reset);
      setActiveChatId(reset[0].id);
    } else {
      setChats(filtered);
      if (activeChatId === id) setActiveChatId(filtered[0].id);
    }
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    const newMessage = { role: "user", text };
    const updatedChats = chats.map(chat => {
      if (chat.id === activeChatId) {
        const newTitle = chat.messages.length === 0 ? text.substring(0, 25) : chat.title;
        return { ...chat, title: newTitle, messages: [...chat.messages, newMessage] };
      }
      return chat;
    });
    setChats(updatedChats);
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
        chat.id === activeChatId ? { ...chat, messages: [...chat.messages, { role: "bot", text: data.output || "نعتذر، لم نتمكن من جلب الرد حالياً." }] } : chat
      ));
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  // مكون محتوى السايد بار (لتجنب التكرار)
  const SidebarContent = () => (
    <>
      <div className="p-8 flex flex-col items-center border-b border-gray-50">
        <div className="flex gap-6 mb-4">
          <img src="/OIP (1).webp" alt="ZUJ Logo" className="w-20 h-20 md:w-24 md:h-24 object-contain" />
          <img src="/OIP (2).webp" alt="Faculty Logo" className="w-20 h-20 md:w-24 md:h-24 object-contain" />
        </div>
        <h2 className="font-black text-[#1e5631] text-lg">جامعة الزيتونة الأردنية</h2>
        <p className="text-[9px] text-gray-400 font-bold tracking-[0.2em] uppercase">" عراقة وجـودة "</p>
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-2">
        <button onClick={createNewChat} className="w-full flex items-center justify-center gap-2 bg-[#1e5631] text-white p-4 rounded-xl font-bold hover:bg-[#163d25] transition-all mb-4 shadow-md">
          <Plus size={20} /> محادثة جديدة
        </button>
        <p className="text-[11px] font-black text-gray-400 px-2 mb-2">سجل الإرشاد</p>
        {chats.map(chat => (
          <div key={chat.id} 
               onClick={() => { setActiveChatId(chat.id); setIsMobileMenuOpen(false); }} 
               className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${activeChatId === chat.id ? "bg-green-50 border border-green-100" : "hover:bg-gray-50"}`}>
            <div className="flex items-center gap-3 overflow-hidden">
              <MessageSquare size={18} className={activeChatId === chat.id ? "text-[#1e5631]" : "text-gray-400"} />
              <span className={`text-sm truncate ${activeChatId === chat.id ? "text-[#1e5631] font-bold" : "text-gray-600"}`}>{chat.title}</span>
            </div>
            <Trash2 size={15} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => deleteChat(chat.id, e)} />
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-100 bg-gray-50/50 space-y-2">
        <p className="text-[10px] font-black text-gray-400 px-2 uppercase mb-2">بوابة الخدمات الطلابية</p>
        <a href="https://www.zuj.edu.jo/" target="_blank" rel="noreferrer" className="flex items-center justify-between p-2.5 bg-white rounded-lg text-xs font-bold text-gray-600 hover:text-[#1e5631] shadow-sm transition-all group">
          <div className="flex items-center gap-2"><Globe size={14} className="text-blue-500" /> <span>موقع الجامعة</span></div>
          <ExternalLink size={12} className="opacity-0 group-hover:opacity-100" />
        </a>
        <a href="https://elearning.zuj.edu.jo/" target="_blank" rel="noreferrer" className="flex items-center justify-between p-2.5 bg-white rounded-lg text-xs font-bold text-gray-600 hover:text-[#1e5631] shadow-sm transition-all group">
          <div className="flex items-center gap-2"><GraduationCap size={14} className="text-green-600" /> <span>التعلم الإلكتروني</span></div>
          <ExternalLink size={12} className="opacity-0 group-hover:opacity-100" />
        </a>
        <a href="https://exams.zuj.edu.jo" target="_blank" rel="noreferrer" className="flex items-center justify-between p-2.5 bg-red-50/50 rounded-lg text-xs font-bold text-red-700 shadow-sm transition-all group border border-red-50">
          <div className="flex items-center gap-2"><ClipboardList size={14} /> <span>بوابة الامتحانات</span></div>
          <ExternalLink size={12} />
        </a>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-[#F4F7F5] font-['Cairo'] text-right" dir="rtl">
      
      {/* SIDEBAR - Desktop */}
      <aside className="w-85 bg-white border-l border-gray-100 flex flex-col shadow-xl hidden lg:flex">
        <SidebarContent />
      </aside>

      {/* SIDEBAR - Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="relative w-80 bg-white h-full shadow-2xl flex flex-col animate-slide-left">
            <button className="absolute left-4 top-4 p-2 text-gray-400 hover:text-red-500" onClick={() => setIsMobileMenuOpen(false)}>
              <X size={24} />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-[#1e5631] text-white flex items-center justify-between px-4 md:px-8 z-10 shadow-lg">
          <div className="flex items-center gap-3">
            {/* زر فتح المنيو للجوال */}
            <button className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
            
            <div className="p-2 bg-white/10 rounded-lg hidden sm:block"><Bot size={26} /></div>
            <div>
               <h1 className="text-sm md:text-lg font-black leading-none">المرشد الأكاديمي الذكي</h1>
               <p className="text-[9px] md:text-[10px] font-bold opacity-70 mt-1">" الريادة والإبداع في الأعمال "</p>
            </div>
          </div>
          <span className="text-[9px] md:text-[11px] font-black bg-white/10 px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-white/20 uppercase">نظم المعلومات الإدارية</span>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-10">
          <div className="max-w-4xl mx-auto space-y-6">
            {activeChat.messages.length === 0 ? (
              <div className="text-center py-10 md:py-16 animate-fade-in bg-white rounded-[30px] md:rounded-[40px] shadow-2xl border border-gray-50 p-6 md:p-10">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-green-50 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                   <Layout size={30} className="md:size-[40px] text-[#1e5631]" />
                </div>
                <h2 className="text-xl md:text-3xl font-black text-gray-900 mb-2">مرحباً بكِ في منصة الإرشاد</h2>
                <p className="text-gray-500 text-sm md:text-base mb-8 md:mb-10 font-medium">نحن هنا لخدمة طلاب كلية الأعمال وتسهيل مسيرتهم الأكاديمية</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 max-w-2xl mx-auto">
                  {["الخطة الدراسية لكلية الأعمال", "شروط تسجيل مشروع التخرج", "الحد الأعلى للساعات المعتمدة", "إجراءات التحويل بين التخصصات"].map((q, i) => (
                    <button key={i} onClick={() => sendMessage(q)} className="p-4 md:p-5 bg-gray-50 border border-gray-100 rounded-2xl text-xs md:text-sm font-bold text-gray-700 hover:border-[#1e5631] hover:bg-green-50 hover:text-[#1e5631] transition-all flex justify-between items-center group">
                      {q} <span className="opacity-0 group-hover:opacity-100">←</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              activeChat.messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} message-appear`}>
                  <div className={`p-4 md:p-5 rounded-2xl max-w-[90%] md:max-w-[85%] text-sm md:text-base leading-relaxed ${
                    msg.role === "user" 
                    ? "bg-[#1e5631] text-white shadow-lg shadow-green-900/20 rounded-tr-none" 
                    : "bg-white border border-gray-200 text-gray-800 shadow-sm rounded-tl-none"
                  }`}>
                    {formatResponse(msg.text)}
                  </div>
                </div>
              ))
            )}
            {loading && <div className="text-xs md:text-sm font-bold text-[#1e5631] animate-pulse pr-4">جاري تحليل البيانات الأكاديمية...</div>}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <footer className="p-4 md:p-6 bg-white border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(inputValue); }} className="max-w-4xl mx-auto flex gap-2 md:gap-3">
            <input 
              className="flex-1 p-4 md:p-5 rounded-2xl border-none focus:ring-2 focus:ring-[#1e5631] outline-none transition-all text-xs md:text-sm font-bold bg-[#F4F7F5] shadow-inner" 
              placeholder="اسأل مرشدك الأكاديمي..." 
              value={inputValue} 
              onChange={(e) => setInputValue(e.target.value)} 
            />
            <button className="bg-[#1e5631] text-white px-5 md:px-8 rounded-2xl hover:bg-[#163d25] transition-all shadow-lg flex items-center">
              <Send size={20} className="rotate-180" />
            </button>
          </form>
        </footer>
      </main>
    </div>
  );
}