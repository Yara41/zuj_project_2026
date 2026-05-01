export async function handler(event) {
  // 🔹 دعم preflight (CORS)
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: "",
    };
  }

  try {
    // 🔹 التحقق من body
    if (!event.body) {
      return {
        statusCode: 400,
        headers: corsHeaders(),
        body: JSON.stringify({ error: "No body provided" }),
      };
    }

    const body = JSON.parse(event.body);

    // 🔹 timeout (10 ثواني)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    // 🔥 رابط n8n (خليه زي ما هو إذا شغال)
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

    // 🔥 توحيد الرد (أقوى نسخة)
    let finalOutput =
      data.output ||
      data.response ||
      data.answer ||
      data.text ||
      (Array.isArray(data) && (data[0]?.output || data[0]?.text)) ||
      text;

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({
        output: finalOutput,
      }),
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({
        error: "Failed to connect to AI Server",
        details: error.message,
      }),
    };
  }
}

// 🔹 CORS headers
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };
}