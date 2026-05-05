export async function handler(event) {
  // 🔹 دعم preflight (CORS) لضمان قبول الطلبات من المتصفح
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: "",
    };
  }

  try {
    // 🔹 التحقق من وجود بيانات في الطلب
    if (!event.body) {
      return {
        statusCode: 400,
        headers: corsHeaders(),
        body: JSON.stringify({ error: "No body provided" }),
      };
    }

    const body = JSON.parse(event.body);

    // 🔹 رفع التايم أوت إلى 20 ثانية (لأن عمليات البحث وإعادة الترتيب تأخذ وقتاً)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    // 🔥 تأكدي أن هذا هو رابط الـ Production (بدون كلمة test)
    // وتأكدي أن الـ Workflow في n8n هو "Active"
    const N8N_URL = "http://13.61.19.235:5678/webhook/fc028940-84fb-40a3-95e2-e7437566b8d7";

    const response = await fetch(N8N_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chatInput: body.question, // هنا نرسل السؤال لـ n8n تحت اسم chatInput
        sessionId: body.sessionId || "user_default",
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    // 🔹 قراءة الرد ومعالجة حالات النص أو الـ JSON
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { output: text };
    }

    // 🔥 آلية استخراج الرد (تغطي كافة التوقعات من n8n)
    // سيبحث عن النتيجة في حقول: output, response, answer, text
    let finalOutput =
      data.output || 
      data.response || 
      data.answer || 
      data.text || 
      (Array.isArray(data) && (data[0]?.output || data[0]?.text)) || 
      (typeof data === 'string' ? data : "نعتذر، لم يتم العثور على إجابة.");

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({
        output: finalOutput, // هذا هو الحقل الذي ستقرأه واجهة المستخدم
      }),
    };

  } catch (error) {
    console.error("Function Error:", error);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({
        error: "Failed to connect to AI Server",
        details: error.name === 'AbortError' ? "Request timed out" : error.message,
      }),
    };
  }
}

// 🔹 إعدادات CORS للسماح بالاتصال من أي مصدر (Origin)
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };
}