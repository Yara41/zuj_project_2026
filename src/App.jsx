import { useState, useEffect, useRef } from "react";
import { Trash2, Send, Plus, MessageSquare, ExternalLink } from "lucide-react";

export default function App() {
  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem("zuj_chats");
    return saved ? JSON.parse(saved) : [{ id: Date.now(), title: "محادثة جديدة", messages: [] }];
  });
  const [activeChatId, setActiveChatId] = useState(chats[0].id);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];

  useEffect(() => {
    localStorage.setItem("zuj_chats", JSON.stringify(chats));
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
        const newTitle = chat.messages.length === 0 ? text.substring(0, 20) + "..." : chat.title;
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
      const botMsg = { role: "bot", text: data.output || "عذراً، لم أفهم ذلك." };
      
      setChats(prev => prev.map(chat => 
        chat.id === activeChatId ? { ...chat, messages: [...chat.messages, botMsg] } : chat
      ));
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-[#F4F7F5] font-['Cairo'] text-right" dir="rtl">
      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 right-0 z-50 w-80 bg-white border-l border-gray-200 flex flex-col shadow-2xl transition-transform md:relative md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="p-6 flex flex-col items-center border-b bg-gray-50/50">
          <div className="flex gap-3 mb-4">
            <img src="/OIP (1).webp" className="w-20 h-20 object-contain bg-white rounded-2xl p-2 shadow-sm border border-green-100" />
            <img src="/OIP (2).webp" className="w-20 h-20 object-contain bg-white rounded-2xl p-2 shadow-sm border border-yellow-100" />
          </div>
          <h2 className="font-black text-green-900 text-lg">جامعة الزيتونة الأردنية</h2>
          <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Academic Intelligence Unit</p>
        </div>

        <div className="p-4 flex-1 overflow-y-auto space-y-2">
          <button onClick={createNewChat} className="w-full flex items-center justify-center gap-2 bg-green-800 text-white p-3 rounded-xl font-bold hover:bg-green-900 transition-all shadow-lg shadow-green-900/20 mb-6">
            <Plus size={18} /> محادثة جديدة
          </button>
          
          <p className="text-[11px] font-black text-gray-400 px-2 mb-2">تاريخ المحادثات</p>
          {chats.map(chat => (
            <div key={chat.id} onClick={() => setActiveChatId(chat.id)} className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${activeChatId === chat.id ? "bg-green-50 border border-green-100" : "hover:bg-gray-50"}`}>
              <div className="flex items-center gap-3 overflow-hidden">
                <MessageSquare size={16} className={activeChatId === chat.id ? "text-green-700" : "text-gray-400"} />
                <span className={`text-sm truncate font-medium ${activeChatId === chat.id ? "text-green-900 font-bold" : "text-gray-600"}`}>{chat.title}</span>
              </div>
              <Trash2 size={14} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => deleteChat(chat.id, e)} />
            </div>
          ))}
        </div>

        <div className="p-4 border-t bg-gray-50">
          <div className="space-y-2">
            <a href="https://exams.zuj.edu.jo" target="_blank" className="flex items-center justify-between p-3 bg-red-50 text-red-700 rounded-xl text-xs font-bold border border-red-100 hover:bg-red-100 transition-colors">
              <span>بوابة الامتحانات</span> <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col relative">
        <header className="h-20 bg-green-800 text-white flex items-center justify-between px-8 shadow-md">
          <h1 className="text-xl font-black tracking-tight">المرشد الأكاديمي الذكي | كلية الأعمال</h1>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden p-2 bg-white/10 rounded-lg">القائمة</button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-12">
          <div className="max-w-4xl mx-auto space-y-8">
            {activeChat.messages.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-[40px] shadow-sm border border-gray-100 px-10">
                <div className="w-24 h-24 bg-green-50 rounded-3xl flex items-center justify-center mx-auto mb-8 transform -rotate-6">
                  <span className="text-5xl">🤖</span>
                </div>
                <h2 className="text-3xl font-black text-gray-800 mb-4">مرحباً بك في منصة الإرشاد الذكي</h2>
                <p className="text-gray-500 mb-10 max-w-lg mx-auto leading-relaxed">أنا مرشدك الذكي، متواجد لمساعدتك في كل ما يخص تخصصك بكلية الأعمال واللوائح الأكاديمية.</p>
                <div className="grid md:grid-cols-2 gap-4">
                  {["الخطة الدراسية لكلية الأعمال", "شروط تسجيل مشروع التخرج"].map((q, i) => (
                    <button key={i} onClick={() => sendMessage(q)} className="p-5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-700 hover:border-green-500 hover:bg-green-50 transition-all text-right shadow-sm">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              activeChat.messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}>
                  <div className={`p-5 rounded-3xl max-w-[85%] shadow-sm leading-relaxed ${
                    msg.role === "user" 
                    ? "bg-white border border-gray-200 text-gray-800 rounded-tr-none" 
                    : "bg-green-800 text-white rounded-tl-none font-medium shadow-green-900/10"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))
            )}
            {loading && <div className="flex justify-end"><div className="bg-green-50 text-green-800 p-4 rounded-2xl animate-pulse font-bold text-sm">جاري معالجة طلبك...</div></div>}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <footer className="p-6 bg-white border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(inputValue); }} className="max-w-4xl mx-auto flex gap-4">
            <input className="flex-1 p-5 rounded-2xl border-2 border-gray-100 focus:border-green-600 outline-none transition-all text-base font-medium shadow-inner bg-gray-50/50" placeholder="اسألي مرشدك الأكاديمي..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
            <button className="bg-green-800 text-white px-10 rounded-2xl hover:bg-green-900 transition-all font-black flex items-center gap-2 shadow-lg shadow-green-900/20">
              إرسال <Send size={18} className="rotate-180" />
            </button>
          </form>
        </footer>
      </main>
    </div>
  );
}