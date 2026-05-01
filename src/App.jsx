import { useState } from "react";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // إضافة رسالة
  const addMessage = (text, isUser = false) => {
    setMessages((prev) => [...prev, { text, isUser }]);
  };

  // تنظيف الرد
  const extractReply = (data) => {
    try {
      if (!data) return "لم يتم العثور على رد.";

      if (typeof data === "string") return data;
      if (data.output) return data.output;
      if (data.response) return data.response;
      if (data.answer) return data.answer;

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

    const userText = input;
    setInput("");

    addMessage(userText, true);
    addMessage("جاري المعالجة...", false);

    try {
      const res = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: userText,
          sessionId: "zuj_user",
        }),
      });

      const data = await res.json();

      // حذف loading
      setMessages((prev) => prev.slice(0, -1));

      const reply = extractReply(data);
      addMessage(reply, false);

    } catch (err) {
      setMessages((prev) => prev.slice(0, -1));
      addMessage("حدث خطأ أثناء الاتصال بالخادم.", false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">

      {/* 🔵 اليسار: الشات */}
      <div className="flex flex-col flex-1 p-4">

        {/* العنوان */}
        <div className="bg-green-700 text-white p-4 rounded-xl mb-4 text-right font-bold">
          المساعد الأكاديمي
        </div>

        {/* الرسائل */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-4">

          {/* أزرار جاهزة */}
          {messages.length === 0 && (
            <div className="space-y-3">
              <button
                onClick={() => setInput("كم عدد الساعات المسموح تسجيلها؟")}
                className="bg-green-700 text-white px-4 py-2 rounded-xl"
              >
                كم عدد الساعات المسموح تسجيلها؟
              </button>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`p-3 rounded-xl max-w-[70%] text-sm ${
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
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="اكتبي سؤالك هنا..."
            className="flex-1 p-3 border rounded-xl"
          />
          <button
            onClick={sendMessage}
            className="bg-green-700 text-white px-4 rounded-xl"
          >
            إرسال
          </button>
        </div>
      </div>

      {/* 🟢 اليمين: معلومات الجامعة */}
      <div className="w-[320px] bg-white p-6 hidden md:flex flex-col items-center border-l">

        {/* اللوقو */}
        <img
          src="/logo.png"
          alt="جامعة الزيتونة"
          className="w-40 mb-4"
        />

        <h2 className="text-green-700 font-bold mb-6 text-center">
          جامعة الزيتونة الأردنية
        </h2>

        <button className="bg-green-700 text-white px-4 py-2 rounded-xl w-full mb-4">
          محادثة جديدة +
        </button>

        <div className="w-full space-y-3">
          <button className="w-full bg-gray-100 p-3 rounded-xl text-right">
            🌐 موقع الجامعة
          </button>
          <button className="w-full bg-gray-100 p-3 rounded-xl text-right">
            🎓 التعلم الإلكتروني
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;