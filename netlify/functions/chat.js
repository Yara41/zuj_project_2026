export async function handler(event) {
  try {
    // التأكد من وجود بيانات في الـ body
    if (!event.body) {
      return { statusCode: 400, body: JSON.stringify({ error: "No body provided" }) };
    }

    const body = JSON.parse(event.body);

    const response = await fetch(
      "http://13.61.19.235:5678/webhook/b7ed42af-3773-4af7-a9d3-704e062369c8",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatInput: body.question, // الاسم اللي بيستناه الـ AI Agent
        }),
      }
    );

    // استقبال الرد كنص أولاً
    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { output: text }; // n8n أحياناً برجع نص مجرد
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // عشان يسمح للمتصفح يقرأ الرد
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to connect to AI Server",
        details: error.message,
      }),
    };
  }
}