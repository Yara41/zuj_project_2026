import React, { useState, useEffect } from 'react';
import { Send, Trash, User, Bot, Plus, MessageSquare, Heart, BookOpen, Star, Menu, X } from 'lucide-react';

const MentorApp = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [currentId, setCurrentId] = useState(Date.now());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // للتحكم في القائمة على الموبايل

  // تحميل البيانات عند تشغيل التطبيق
  useEffect(() => {
    const savedData = localStorage.getItem('mentor_data');
    if (savedData) {
      setConversations(JSON.parse(savedData));
    }
  }, []);

  const handleSend = async (text = input) => {
    const messageText = typeof text === 'string' ? text : input;
    if (!messageText.trim()) return;

    const userMessage = { role: 'user', content: messageText };
    const updatedMessages = [...messages, userMessage];
    
    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('http://13.61.19.235:5678/webhook/fc028940-84fb-40a3-95e2-e7437566b8d7', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: messageText }),
      });

      if (!response.ok) throw new Error('فشل الاتصال');

      const data = await response.json();
      const botResponse = data.output || data.response || (data[0] && data[0].output);
      
      const botMsg = { 
        role: 'bot', 
        content: botResponse || "عذراً، لم أتمكن من الحصول على إجابة." 
      };

      const finalMessages = [...updatedMessages, botMsg];
      setMessages(finalMessages);

      // تحديث قائمة المحادثات
      let updatedConv;
      const existingConv = conversations.find(c => c.id === currentId);
      
      if (existingConv) {
        updatedConv = conversations.map(c => 
          c.id === currentId ? { ...c, messages: finalMessages } : c
        );
      } else {
        updatedConv = [{ id: currentId, messages: finalMessages }, ...conversations];
      }
      
      setConversations(updatedConv);
      localStorage.setItem('mentor_data', JSON.stringify(updatedConv));

    } catch (error) {
      setMessages([...updatedMessages, { 
        role: 'bot', 
        content: 'عذراً، حدث خطأ في الاتصال.' 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  // وظيفة مسح محادثة معينة (سلة المهملات)
  const deleteConversation = (e, id) => {
    e.stopPropagation();
    const updated = conversations.filter(c => c.id !== id);
    setConversations(updated);
    localStorage.setItem('mentor_data', JSON.stringify(updated));
    if (currentId === id) {
      setMessages([]);
      setCurrentId(Date.now());
    }
  };

  const quickSend = (text) => handleSend(text);

  return (
    <div className="flex h-screen bg-[#f8f9fa] font-sans text-right overflow-hidden" dir="rtl">
      
      {/* Sidebar - القائمة الجانبية (متجاوبة) */}
      <div className={`
        fixed inset-y-0 right-0 z-50 w-72 bg-white border-l border-gray-200 flex flex-col shadow-xl transition-transform duration-300 lg:relative lg:translate-x-0 lg:shadow-sm
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 lg:block">
             <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Heart className="text-rose-500" /> المرشد الذكي
             </h1>
             <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2"><X /></button>
          </div>
          
          {/* زر استشارة جديدة - تم تفعيل الوظيفة */}
          <button 
            onClick={() => {
              setCurrentId(Date.now());
              setMessages([]);
              setIsSidebarOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 bg-[#5d6d54] text-white py-3 rounded-xl hover:bg-[#4a5743] transition-all shadow-md active:scale-95"
          >
            <Plus size={20} /> استشارة جديدة
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <p className="text-xs font-semibold text-gray-400 mb-4 px-2 uppercase tracking-wider">المحادثات السابقة</p>
          {conversations.map(conv => (
            <div key={conv.id} 
                 onClick={() => { setCurrentId(conv.id); setMessages(conv.messages); setIsSidebarOpen(false); }}
                 className={`group flex items-center justify-between p-3 rounded-xl mb-2 cursor-pointer transition-all ${currentId === conv.id ? 'bg-[#f0f4ee] text-[#5d6d54]' : 'hover:bg-gray-50'}`}>
              <div className="flex items-center gap-3 overflow-hidden">
                <MessageSquare size={18} className={currentId === conv.id ? 'text-[#5d6d54]' : 'text-gray-400'} />
                <span className="truncate text-sm font-medium">{conv.messages[0]?.content || 'استشارة جديدة'}</span>
              </div>
              <button 
                onClick={(e) => deleteConversation(e, conv.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-rose-50 rounded-lg transition-all"
              >
                <Trash size={16} className="text-gray-400 hover:text-rose-500" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative bg-[#fdfdfd] w-full">
        {/* Header */}
        <div className="p-4 lg:p-6 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-10 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
                <Menu size={24} />
            </button>
            <div>
              <h2 className="text-lg lg:text-xl font-bold text-gray-800">جلسة استشارية</h2>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-xs text-gray-500 font-medium">متصل الآن</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6">
          {messages.length === 0 && (
            <div className="text-center mt-10 lg:mt-20">
              <div className="bg-rose-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="text-rose-500" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800">كيف يمكنني مساعدتك اليوم؟</h3>
              <p className="text-gray-500 mt-2 max-w-xs mx-auto">أنا هنا لدعمك في رحلتك التربوية والأسرية بكل خصوصية.</p>
            </div>
          )}
          
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] lg:max-w-[75%] flex gap-3 lg:gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 lg:w-9 lg:h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-[#5d6d54]' : 'bg-white border border-gray-100'}`}>
                  {msg.role === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-[#5d6d54]" />}
                </div>
                <div className={`p-3 lg:p-4 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-[#5d6d54] text-white rounded-tr-none' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'}`}>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-100 p-4 rounded-2xl flex gap-1 shadow-sm">
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestions - تحسين البطاقات */}
        <div className="px-4 lg:px-8 pb-4">
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              { id: '1', text: 'عناد الطفل', icon: <User size={14} />, color: 'hover:border-amber-400 hover:text-amber-700 hover:bg-amber-50' },
              { id: '2', text: 'وقت الدراسة', icon: <BookOpen size={14} />, color: 'hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50' },
              { id: '3', text: 'الثقة بالنفس', icon: <Star size={14} />, color: 'hover:border-rose-400 hover:text-rose-700 hover:bg-rose-50' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => quickSend(item.text)}
                className={`flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-sm transition-all duration-300 text-gray-600 text-sm font-medium hover:-translate-y-1 hover:shadow-md ${item.color}`}
              >
                {item.icon}
                {item.text}
              </button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 lg:p-8 pt-0">
          <div className="relative max-w-4xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="اسأل المرشد التربوي..."
              className="w-full p-4 lg:p-5 pr-4 pl-14 rounded-2xl border border-gray-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-[#5d6d54]/20 focus:border-[#5d6d54] transition-all bg-white text-sm lg:text-base"
            />
            <button 
              onClick={() => handleSend()}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-[#5d6d54] p-2 lg:p-2.5 rounded-xl text-white hover:bg-[#4a5743] transition-all shadow-md active:scale-90"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Overlay للموبايل */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}
    </div>
  );
};

export default MentorApp;