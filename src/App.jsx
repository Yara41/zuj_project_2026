const sendMessage = async (text) => {
  if (!text.trim()) return;

  const userMsg = { role: "user", text };
  setMessages((prev) => [...prev, userMsg]);
  setInputValue("");
  setLoading(true);

  if (window.innerWidth < 768) setIsSidebarOpen(false);

  try {
    // ✅ بدلنا الرابط (حل مشكلة https)
    const res = await fetch("/.netlify/functions/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: text,
        sessionId: "zuj_user_session",
      }),
    });

    const data = await res.json();

    // 🔥 حل مشكلة output
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
      { role: "bot", text: "حدث خطأ فني، يرجى التأكد من اتصالك بالإنترنت." },
    ]);
  }

  setLoading(false);
};