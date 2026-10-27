let isRunning = false;
let timeoutId = null;
let savedComments = [];

// স্টোরেজ থেকে ডাটা আপডেট রাখা
chrome.storage.local.get(['isRunning', 'savedComments'], (data) => {
    isRunning = data.isRunning || false;
    savedComments = data.savedComments || [];
    createFloatingButton();
    if (isRunning) startLoop();
});

// স্টোরেজ পরিবর্তন হলে (পপআপ বা ফ্লোটিং বাটন ক্লিক করলে) রেসপন্স করা
chrome.storage.onChanged.addListener((changes) => {
    if (changes.savedComments) savedComments = changes.savedComments.newValue;
    
    if (changes.isRunning) {
        isRunning = changes.isRunning.newValue;
        updateFloatingButton(isRunning);
        
        if (isRunning) {
            startLoop();
        } else {
            clearTimeout(timeoutId);
        }
    }
});

// ইউটিউবের স্ক্রিনে একটি ফ্লোটিং বাটন তৈরি করা
function createFloatingButton() {
    // শুধু চ্যাট ফ্রেমের ভেতরে বাটনটি দেখাবে
    if (!window.location.pathname.includes('live_chat')) return;

    const btn = document.createElement('button');
    btn.id = "yt-auto-float-btn";
    btn.innerText = isRunning ? "⏹ STOP BOT" : "▶ START BOT";
    Object.assign(btn.style, {
        position: 'fixed', top: '10px', left: '10px', zIndex: '9999',
        padding: '8px 15px', background: isRunning ? '#cc0000' : '#2ba640',
        color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer',
        fontWeight: 'bold', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', fontSize: '12px'
    });

    btn.onclick = () => {
        if (savedComments.length === 0) {
            alert("Please SAVE a comment from the extension popup first!");
            return;
        }
        chrome.storage.local.set({ isRunning: !isRunning });
    };

    document.body.appendChild(btn);
}

function updateFloatingButton(state) {
    const btn = document.getElementById('yt-auto-float-btn');
    if (btn) {
        btn.innerText = state ? "⏹ STOP BOT" : "▶ START BOT";
        btn.style.background = state ? '#cc0000' : '#2ba640';
    }
}

// মূল কমেন্ট করার লুপ ফাংশন
function startLoop() {
    if (!isRunning || savedComments.length === 0) return;

    const chatInput = document.querySelector('div#input.yt-live-chat-text-input-field-renderer');
    if (!chatInput) {
        // চ্যাট বক্স না পেলে ১ সেকেন্ড পর আবার খুঁজবে
        timeoutId = setTimeout(startLoop, 1000);
        return;
    }

    const randomIndex = Math.floor(Math.random() * savedComments.length);
    let finalComment = savedComments[randomIndex];
    const emojis = ["😀", "🔥", "👍", "❤️", "🙌", "😎", "💯", "✨", "🎉", "✌️", "🚀", "🌟"];
    finalComment += " " + emojis[Math.floor(Math.random() * emojis.length)];

    postComment(finalComment, chatInput);

    // ১ থেকে ৫ সেকেন্ডের মধ্যে র‍্যান্ডম টাইম (1000ms - 5000ms)
    const randomDelay = Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000;
    
    timeoutId = setTimeout(startLoop, randomDelay);
}

function postComment(text, chatInput) {
    const sendButton = document.querySelector('#send-button button');

    if (chatInput && sendButton) {
        chatInput.focus();
        
        // ডাবল পেস্ট (hi hi) ফিক্স: ইনপুট বক্সটি আগে পুরো ক্লিয়ার করে নেওয়া
        chatInput.innerHTML = ''; 
        
        // নতুন টেক্সট বসানো
        document.execCommand("insertText", false, text);
        chatInput.dispatchEvent(new InputEvent("input", { bubbles: true }));

        setTimeout(() => {
            sendButton.removeAttribute('disabled');
            sendButton.click();
        }, 500);
    }
}