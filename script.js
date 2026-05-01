<script>
const chatWindow = document.getElementById('chatWindow');
const messagesContent = document.getElementById('messagesContent');
const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('userInput');

const webhookUrl = 'http://13.61.19.235:5678/webhook/403c03b2-ca17-4b9f-9d52-ced767db5b3b';
const sessionId = "user1";

// إضافة رسالة
function addMessage(text, isUser = false) {
    const wrapper = document.createElement('div');
    wrapper.className = `flex ${isUser ? 'justify-end' : 'justify-start'}`;

    const bubble = document.createElement('div');
    bubble.className = `message-bubble p-4 md:p-5 ${isUser ? 'user-message' : 'bot-message'}`;

    const messageText = document.createElement('p');
    messageText.className = 'text-sm md:text-base leading-relaxed';
    messageText.innerText = text;

    bubble.appendChild(messageText);
    wrapper.appendChild(bubble);
    messagesContent.appendChild(wrapper);

    scrollToBottom();
}

// لودينج
function showLoading() {
    const wrapper = document.createElement('div');
    wrapper.id = 'loadingIndicator';
    wrapper.className = 'flex justify-start';

    wrapper.innerHTML = `
        <div class="message-bubble bot-message p-4 shadow-sm flex items-center gap-3">
            <span class="text-xs text-blue-600 font-bold">جاري المعالجة</span>
            <div class="loading-dots">
                <span></span><span></span><span></span>
            </div>
        </div>
    `;

    messagesContent.appendChild(wrapper);
    scrollToBottom();
}

function removeLoading() {
    const indicator = document.getElementById('loadingIndicator');
    if (indicator) indicator.remove();
}

// سكرول
function scrollToBottom() {
    chatWindow.scrollTo({
        top: chatWindow.scrollHeight,
        behavior: 'smooth'
    });
}

// 🔥 أهم تعديل هنا
function extractReply(data) {
    try {
        if (!data) return "لم يتم العثور على رد.";

        // إذا الرد string مباشر
        if (typeof data === 'string') return data;

        // إذا جاي من n8n بشكل منظم
        if (data.output) return data.output;

        // إذا جاي array
        if (Array.isArray(data)) {
            if (data[0]?.output) return data[0].output;
            if (data[0]?.text) return data[0].text;
        }

        // fallback
        return JSON.stringify(data);
    } catch {
        return "حدث خطأ في قراءة الرد.";
    }
}

// إرسال الرسالة
async function sendMessageToWebhook(message) {
    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chatInput: message,
                sessionId: sessionId
            })
        });

        if (!response.ok) throw new Error('API Error');

        const data = await response.json();

        return extractReply(data);

    } catch (error) {
        console.error('Error:', error);
        return "حدث خطأ أثناء الاتصال بالخادم.";
    }
}

// إرسال من الفورم
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const message = userInput.value.trim();
    if (!message) return;

    addMessage(message, true);
    userInput.value = '';
    showLoading();

    const reply = await sendMessageToWebhook(message);

    removeLoading();
    addMessage(reply, false);
});
</script>