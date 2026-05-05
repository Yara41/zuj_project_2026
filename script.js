const messagesContainer = document.getElementById('messagesContainer');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const historyList = document.getElementById('historyList');
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');

// حفظ المحادثات في localStorage
let history = JSON.parse(localStorage.getItem('family_mentor_history')) || [];

function renderHistory() {
    historyList.innerHTML = '';
    history.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `<span>${item.title}</span><span onclick="deleteChat(${index})">🗑️</span>`;
        historyList.appendChild(div);
    });
}

function appendMessage(role, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${role}`;
    msgDiv.innerText = text;
    messagesContainer.appendChild(msgDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showTyping() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot';
    typingDiv.id = 'typing';
    typingDiv.innerText = 'جاري التفكير...';
    messagesContainer.appendChild(typingDiv);
}

sendBtn.onclick = () => {
    const text = userInput.value;
    if(!text) return;

    appendMessage('user', text);
    userInput.value = '';
    
    // حفظ في السجل إذا كانت أول رسالة
    if(history.length === 0 || text.length > 5) {
        history.push({title: text.substring(0, 20), date: new Date()});
        localStorage.setItem('family_mentor_history', JSON.stringify(history));
        renderHistory();
    }

    showTyping();

    // محاكاة رد الذكاء الاصطناعي
    setTimeout(() => {
        document.getElementById('typing').remove();
        appendMessage('bot', "شكراً لسؤالك. بخصوص هذا الأمر التربوي، أنصحك بالصبر والحوار المستمر مع الأبناء.");
    }, 1500);
};

function quickSend(text) {
    userInput.value = text;
    sendBtn.click();
}

function deleteChat(index) {
    history.splice(index, 1);
    localStorage.setItem('family_mentor_history', JSON.stringify(history));
    renderHistory();
}

menuToggle.onclick = () => sidebar.classList.toggle('active');

renderHistory();