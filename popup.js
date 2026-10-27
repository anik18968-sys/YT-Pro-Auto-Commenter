const commentText = document.getElementById('commentText');
const saveBtn = document.getElementById('saveBtn');
const startBtn = document.getElementById('startBtn');
const statusDiv = document.getElementById('status');

// লোড হওয়ার সময় চেক করবে আগে সেভ করা আছে কিনা
chrome.storage.local.get(['savedComments', 'isRunning'], (data) => {
    if (data.savedComments) {
        commentText.value = data.savedComments.join('\n');
        startBtn.style.display = 'block'; // সেভ থাকলে স্টার্ট বাটন দেখাবে
    }
    updateStartButton(data.isRunning);
});

// সেভ বাটন লজিক
saveBtn.addEventListener('click', () => {
    const text = commentText.value.trim();
    if (!text) {
        statusDiv.innerText = "⚠️ Please write something!";
        startBtn.style.display = 'none';
        return;
    }
    const commentsArray = text.split('\n').filter(c => c.trim() !== '');
    
    chrome.storage.local.set({ savedComments: commentsArray }, () => {
        statusDiv.innerText = "✅ Saved successfully!";
        startBtn.style.display = 'block'; // সেভ করার পর স্টার্ট ভিজিবল হবে
    });
});

// স্টার্ট/স্টপ বাটন লজিক
startBtn.addEventListener('click', () => {
    chrome.storage.local.get(['isRunning'], (data) => {
        const newState = !data.isRunning;
        chrome.storage.local.set({ isRunning: newState });
        updateStartButton(newState);
    });
});

function updateStartButton(isRunning) {
    if (isRunning) {
        startBtn.innerText = "⏹ STOP";
        startBtn.classList.add("running");
        statusDiv.innerText = "🚀 Bot is running...";
    } else {
        startBtn.innerText = "▶ START";
        startBtn.classList.remove("running");
        statusDiv.innerText = "Bot is stopped.";
    }
}