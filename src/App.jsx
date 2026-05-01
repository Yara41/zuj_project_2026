import { useState } from "react";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // إضافة رسالة
  const addMessage = (text, isUser = false) => {
    setMessages((prev) => [...prev, { text, isUser }]);
  };

  // 🔥 أهم تعديل: تنظيف الرد
  const extractReply = (data) => {
    try {
      if (!data) return "لم يتم العثور على رد.";

      // إذا رجع نص مباشر
      if (typeof data === "string") return data;

      // إذا من Netlify
      if (data.output) return data.output;

      // إذا object مختلف
      if (data.response) return data.response;
      if (data.answer) return data.answer;

      // إذا array
      if (Array.isArray(data)) {
        if (data[0]?.output) return data[0].output;
        if (data[0]?.text) return data[0].text;
      }

      return JSON.stringify(data);
    } catch {
      return "حدث خطأ في قراءة الرد.";
    }
  };

  // إرسال الرسالة
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput("");
    addMessage(userMessage, true);

    // loading مؤقت
    addMessage("جاري المعالجة...", false);

    try {
      const res = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: userMessage,
          sessionId: "zuj_user",
        }),
      });

      const data = await res.json();

      // حذف رسالة اللودينج
      setMessages((prev) => prev.slice(0, -1));

      const reply = extractReply(data);

      addMessage(reply, false);
    } catch (error) {
      setMessages((prev) => prev.slice(0, -1));
      addMessage("حدث خطأ أثناء الاتصال بالخادم.", false);
      console.error(error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">

      {/* الشات */}
      <div className="flex flex-col flex-1 p-4">

        {/* الرسائل */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`p-3 rounded-lg max-w-[70%] text-sm ${
                  msg.isUser
                    ? "bg-green-600 text-white"
                    : "bg-white border"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* الإدخال */}
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 p-3 border rounded-lg"
            placeholder="اكتبي سؤالك هنا..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            onClick={sendMessage}
            className="bg-green-600 text-white px-4 rounded-lg"
          >
            إرسال
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;