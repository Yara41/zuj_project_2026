import { useState, useEffect, useRef } from "react";
import { Trash2, Send, Plus, MessageSquare, ExternalLink, Globe, GraduationCap, ClipboardList } from "lucide-react";

export default function App() {
  // نظام حفظ المحادثات في ذاكرة المتصفح
  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem("zuj_advisor_chats");
    return saved ? JSON.parse(saved) : [{ id: Date.now(), title: "محادثة جديدة", messages: [] }];
  });
  
  const [activeChatId, setActiveChatId] = useState(chats[0].id);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];

  useEffect(() => {
    localStorage.setItem("zuj_advisor_chats", JSON.stringify(chats));
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  const createNewChat = () => {
    const newChat = { id: Date.now(), title: "محادثة جديدة", messages: [] };
    setChats([newChat, ...chats]);
    setActiveChatId(newChat.id);
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
        const newTitle = chat.messages.length === 0 ? text.substring(0, 25) + "..." : chat.title;
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
      const botMsg = { role: "bot", text: data.output || "نعتذر، لم نتمكن من جلب الرد حالياً." };
      
      setChats(prev => prev.map(chat => 
        chat.id === activeChatId ? { ...chat, messages: [...chat.messages, botMsg] } : chat
      ));
    } catch (err) {
      console.error("Error fetching chat:", err);
    }
    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-[#F8FAF9] font-['Cairo'] text-right" dir="rtl">
      {/* القائمة الجانبية - SIDEBAR */}
      <aside className={`fixed inset-y-0 right-0 z-50 w-80 bg-white border-l border-gray-200 flex flex-col shadow-2xl transition-transform md:relative md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}`}>
        
        {/* قسم اللوجوهات البارز */}
        <div className="p-6 flex flex-col items-center border-b bg-gradient-to-b from-gray-50 to-white">
          <div className="flex gap-4 mb-4">
            <img src="/OIP (1).webp" alt="ZUJ Logo" className="w-20 h-20 object-contain bg-white rounded-2xl p-2 shadow-md border border-green-50" />
            <img src="/OIP (2).webp" alt="Faculty Logo" className="w-20 h-20 object-contain bg-white rounded-2xl p-2 shadow-md border border-yellow-50" />
          </div>
          <h2 className="font-black text-[#1e5631] text-lg">جامعة الزيتونة الأردنية</h2>
          <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mt-1">Academic Intelligence Unit</p>
        </div>

        {/* قائمة المحادثات */}
        <div className="p-4 flex-1 overflow-y-auto space-y-2">
          <button onClick={createNewChat} className="w-full flex items-center justify-center gap-2 bg-[#1e5631] text-white p-4 rounded-2xl font-bold hover:bg-[#163d25] transition-all shadow-lg shadow-green-900/20 mb-6">
            <Plus size={20} /> محادثة جديدة
          </button>
          
          <p className="text-[11px] font-black text-gray-400 px-2 mb-2">سجل الإرشاد الأكاديمي</p>
          {chats.map(chat => (
            <div key={chat.id} onClick={() => setActiveChatId(chat.id)} className={`group flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border ${activeChatId === chat.id ? "bg-green-50 border-green-200 shadow-sm" : "border-transparent hover:bg-gray-50"}`}>
              <div className="flex items-center gap-3 overflow-hidden">
                <MessageSquare size={18} className={activeChatId === chat.id ? "text-[#1e5631]" : "text-gray-400"} />
                <span className={`text-sm truncate font-bold ${activeChatId === chat.id ? "text-[#1e5631]" : "text-gray-600"}`}>{chat.title}</span>
              </div>
              <Trash2 size={16} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => deleteChat(chat.id, e)} />
            </div>
          ))}
        </div>

        {/* بوابة الخدمات الكاملة */}
        <div className="p-4 border-t bg-gray-50 space-y-3">
          <p className="text-[10px] font-black text-gray-400 px-2 uppercase tracking-widest">بوابة الخدمات الطلابية</p>
          <div className="grid gap-2">
            <a href="https://www.zuj.edu.jo/" target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-white hover:bg-green-50 text-gray-700 rounded-xl text-xs font-bold border border-gray-100 transition-all group">
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-blue-500" />
                <span>موقع الجامعة</span>
              </div>
              <ExternalLink size={12} className="opacity-40 group-hover:opacity-100" />
            </a>

            <a href="https://elearning.zuj.edu.jo/" target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-white hover:bg-green-50 text-gray-700 rounded-xl text-xs font-bold border border-gray-100 transition-all group">
              <div className="flex items-center gap-2">
                <GraduationCap size={16} className="text-green-600" />
                <span>التعلم الإلكتروني</span>
              </div>
              <ExternalLink size={12} className="opacity-40 group-hover:opacity-100" />
            </a>

            <a href="https://exams.zuj.edu.jo" target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-red-50/50 text-red-700 rounded-xl text-xs font-bold border border-red-100 hover:bg-red-50 transition-all">
              <div className="flex items-center gap-2">
                <ClipboardList size={16} />
                <span>بوابة الامتحانات</span>
              </div>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </aside>

      {/* المحتوى الرئيسي للشات - MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#F4F7F5]">
        {/* الهيدر العلوي */}
        <header className="h-20 bg-[#1e5631] text-white flex items-center justify-between px-8 shadow-xl z-10">
          <div className="flex items-center gap-3">
            <div className="md:hidden">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-white/10 rounded-lg">القائمة</button>
            </div>
            <h1 className="text-xl font-black tracking-tight">المرشد الأكاديمي | كلية الأعمال</h1>
          </div>
          <span className="hidden md:block text-xs font-bold opacity-70 italic tracking-widest">الريادة والإبداع في الأعمال</span>
        </header>

        {/* منطقة الرسائل */}
        <div className="flex-1 overflow-y-auto p-4 md:p-12 space-y-6">
          <div className="max-w-4xl mx-auto flex flex-col space-y-6">
            {activeChat.messages.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-[40px] shadow-xl border border-gray-100 px-8 animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-green-50 rounded-3xl flex items-center justify-center mx-auto mb-8 transform -rotate-3 shadow-inner">
                  <span className="text-5xl">🤖</span>
                </div>
                <h2 className="text-3xl font-black text-gray-800 mb-4">مرحباً بك في منصة الإرشاد الذكي</h2>
                <p className="text-gray-500 mb-10 max-w-lg mx-auto leading-relaxed text-sm font-medium">أنا مرشدك الأكاديمي الذكي، مخصص لمساعدة طلاب كلية الأعمال في جامعة الزيتونة الأردنية.</p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {["الخطة الدراسية لكلية الأعمال", "شروط تسجيل مشروع التخرج", "الحد الأعلى للساعات المعتمدة", "إجراءات التحويل بين التخصصات"].map((q, i) => (
                    <button key={i} onClick={() => sendMessage(q)} className="p-5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-black text-gray-700 hover:border-[#1e5631] hover:bg-green-50 hover:text-[#1e5631] transition-all text-right flex items-center justify-between group">
                      {q} <span className="opacity-0 group-hover:opacity-100">←</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              activeChat.messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}>
                  <div className={`p-5 rounded-3xl max-w-[85%] shadow-sm leading-relaxed text-sm md:text-base ${
                    msg.role === "user" 
                    ? "bg-white border border-gray-200 text-gray-800 rounded-tr-none shadow-md font-medium" 
                    : "bg-[#1e5631] text-white rounded-tl-none font-bold shadow-green-900/10"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-end">
                <div className="bg-green-50 text-[#1e5631] p-4 rounded-2xl animate-pulse font-black text-sm border border-green-100">
                  جاري مراجعة اللوائح الأكاديمية...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* منطقة الإدخال */}
        <footer className="p-6 bg-white border-t border-gray-100 shadow-[0_-15px_50px_rgba(0,0,0,0.04)]">
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(inputValue); }} className="max-w-4xl mx-auto flex gap-4">
            <input 
              className="flex-1 p-5 rounded-2xl border-2 border-gray-50 focus:border-[#1e5631] outline-none transition-all text-base font-bold shadow-inner bg-gray-50/50" 
              placeholder="اسألي مرشدك الأكاديمي..." 
              value={inputValue} 
              onChange={(e) => setInputValue(e.target.value)} 
            />
            <button className="bg-[#1e5631] text-white px-10 rounded-2xl hover:bg-[#163d25] transition-all font-black flex items-center gap-3 shadow-lg shadow-green-900/30">
              إرسال <Send size={20} className="rotate-180" />
            </button>
          </form>
        </footer>
      </main>
    </div>
  );
}