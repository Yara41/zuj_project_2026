import { useState, useEffect, useRef } from "react";
import { Trash2, Send, Plus, MessageSquare, ExternalLink, Globe, GraduationCap, ClipboardList, Bot } from "lucide-react";

export default function App() {
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

  // وظيفة لتنظيف النص من صيغة JSON إذا ظهرت
  const formatResponse = (text) => {
    try {
      const parsed = JSON.parse(text);
      return parsed.output || text;
    } catch (e) {
      return text;
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
    <div className="flex h-screen bg-[#f0f2f5] font-['Cairo'] text-right" dir="rtl">
      
      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 right-0 z-50 w-85 bg-white border-l border-gray-100 flex flex-col shadow-xl transition-transform md:relative md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}`}>
        
        {/* الشعارات - تم تكبيرها وتحسينها */}
        <div className="p-8 flex flex-col items-center border-b border-gray-50 bg-white">
          <div className="flex gap-6 mb-6 items-center justify-center">
            <img src="/OIP (1).webp" alt="ZUJ Logo" className="w-24 h-24 object-contain transition-transform hover:scale-105" />
            <img src="/OIP (2).webp" alt="Faculty Logo" className="w-24 h-24 object-contain transition-transform hover:scale-105" />
          </div>
          <h2 className="font-black text-[#1e5631] text-xl tracking-tight">جامعة الزيتونة الأردنية</h2>
          <p className="text-[11px] text-gray-400 font-bold tracking-widest uppercase mt-2">Academic Intelligence Unit</p>
        </div>

        {/* قائمة المحادثات */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3">
          <button onClick={createNewChat} className="w-full flex items-center justify-center gap-2 bg-[#1e5631] text-white p-4 rounded-xl font-bold hover:shadow-lg hover:bg-[#163d25] transition-all mb-4">
            <Plus size={20} /> محادثة جديدة
          </button>
          
          <p className="text-[11px] font-black text-gray-400 px-2">سجل المحادثات</p>
          {chats.map(chat => (
            <div key={chat.id} onClick={() => setActiveChatId(chat.id)} className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${activeChatId === chat.id ? "bg-green-50 border border-green-100" : "hover:bg-gray-50"}`}>
              <div className="flex items-center gap-3 overflow-hidden">
                <MessageSquare size={18} className={activeChatId === chat.id ? "text-[#1e5631]" : "text-gray-400"} />
                <span className={`text-sm truncate ${activeChatId === chat.id ? "text-[#1e5631] font-bold" : "text-gray-600"}`}>{chat.title}</span>
              </div>
              <Trash2 size={15} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => deleteChat(chat.id, e)} />
            </div>
          ))}
        </div>

        {/* بوابة الخدمات */}
        <div className="p-4 border-t border-gray-50 bg-white space-y-2">
          <a href="https://www.zuj.edu.jo/" target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg text-xs font-bold text-gray-500 transition-all group">
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-blue-400" />
              <span>موقع الجامعة الرسمي</span>
            </div>
            <ExternalLink size={12} />
          </a>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#1e5631] rounded-lg text-white">
              <Bot size={24} />
            </div>
            <h1 className="text-lg font-black text-gray-800">المرشد الأكاديمي الذكي</h1>
          </div>
          <span className="text-[10px] font-black bg-green-100 text-[#1e5631] px-3 py-1 rounded-full uppercase tracking-tighter">Business Analytics</span>
        </header>

        {/* الرسائل */}
        <div className="flex-1 overflow-y-auto p-4 md:p-10">
          <div className="max-w-4xl mx-auto space-y-8">
            {activeChat.messages.length === 0 ? (
              <div className="text-center py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="mb-6 inline-block p-5 bg-white shadow-2xl rounded-[30px]">
                  <img src="/OIP (1).webp" className="w-16 h-16 opacity-80" alt="Logo" />
                </div>
                <h2 className="text-4xl font-black text-gray-900 mb-4">أهلاً بكِ في المستقبل الأكاديمي</h2>
                <p className="text-gray-500 text-lg mb-12 font-medium">كيف يمكنني مساعدتكِ اليوم في مسيرتكِ الدراسية؟</p>
                
                <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  {["الخطة الدراسية", "مشاريع التخرج", "الساعات المعتمدة", "التحويل بين التخصصات"].map((q, i) => (
                    <button key={i} onClick={() => sendMessage(q)} className="p-6 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-700 hover:shadow-md hover:border-[#1e5631] transition-all flex justify-between items-center group">
                      {q} <span className="text-[#1e5631] opacity-0 group-hover:opacity-100">←</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              activeChat.messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`p-5 rounded-2xl max-w-[85%] text-sm md:text-base leading-relaxed ${
                    msg.role === "user" 
                    ? "bg-[#1e5631] text-white shadow-lg shadow-green-900/10" 
                    : "bg-white border border-gray-100 text-gray-800 shadow-sm"
                  }`}>
                    {formatResponse(msg.text)}
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="flex gap-1 p-4 bg-gray-50 rounded-2xl">
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* INPUT AREA */}
        <footer className="p-6 bg-[#f0f2f5]">
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(inputValue); }} className="max-w-4xl mx-auto flex gap-3">
            <input 
              className="flex-1 p-5 rounded-2xl border-none focus:ring-2 focus:ring-[#1e5631] outline-none transition-all text-sm font-bold shadow-sm bg-white" 
              placeholder="اكتب استفسارك هنا..." 
              value={inputValue} 
              onChange={(e) => setInputValue(e.target.value)} 
            />
            <button className="bg-[#1e5631] text-white px-8 rounded-2xl hover:bg-[#163d25] transition-all shadow-lg flex items-center gap-2">
              <Send size={18} className="rotate-180" />
            </button>
          </form>
        </footer>
      </main>
    </div>
  );
}