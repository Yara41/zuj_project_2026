export default async function handler(req, res) {
  // 🔹 دعم preflight (CORS) - Vercel يعالجها بشكل مختلف قليلاً
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    // 🔹 في Vercel، الـ body يكون محولاً لـ JSON تلقائياً إذا أرسل كـ application/json
    const body = req.body;

    if (!body || !body.question) {
      return res.status(400).json({ error: "No question provided" });
    }

    // 🔹 timeout (10 ثواني)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    // 🔥 رابط n8n الخاص بكِ
    const N8N_URL = "http://13.61.19.235:5678/webhook/b7ed42af-3773-4af7-a9d3-704e062369c8";

    const response = await fetch(N8N_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chatInput: body.question,
        sessionId: body.sessionId || "user1",
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    // 🔹 قراءة الرد
    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { output: text };
    }

    // 🔥 توحيد الرد (نفس المنطق القوي الخاص بكِ)
    let finalOutput =
      data.output ||
      data.response ||
      data.answer ||
      data.text ||
      (Array.isArray(data) && (data[0]?.output || data[0]?.text)) ||
      text;

    return res.status(200).json({
      output: finalOutput,
    });

  } catch (error) {
    return res.status(500).json({
      error: "Failed to connect to AI Server",
      details: error.message,
    });
  }
}