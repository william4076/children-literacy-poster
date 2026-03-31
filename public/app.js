const API_BASE = '';
let currentTaskId = null;
let pollingInterval = null;

// 页面加载时获取主题列表
window.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch(`${API_BASE}/api/themes`);
        const data = await response.json();

        if (data.success) {
            const themeSelect = document.getElementById('theme');
            data.themes.forEach(theme => {
                const option = document.createElement('option');
                option.value = theme;
                option.textContent = theme;
                themeSelect.appendChild(option);
            });
        }
    } catch (error) {
        showStatus('加载主题失败：' + error.message, 'error');
    }
});

async function generatePoster() {
    const theme = document.getElementById('theme').value;
    const title = document.getElementById('title').value;

    if (!theme || !title) {
        showStatus('请填写完整信息', 'error');
        return;
    }

    const btn = document.getElementById('generateBtn');
    btn.disabled = true;
    hideResult();
    showStatus('正在创建任务...', 'loading');

    try {
        const response = await fetch(`${API_BASE}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ theme, title })
        });

        const data = await response.json();

        if (data.success) {
            currentTaskId = data.taskId;
            showStatus('任务已创建，正在生成中...', 'loading');
            startPolling();
        } else {
            showStatus('创建失败：' + data.error, 'error');
            btn.disabled = false;
        }
    } catch (error) {
        showStatus('请求失败：' + error.message, 'error');
        btn.disabled = false;
    }
}

function startPolling() {
    pollingInterval = setInterval(checkStatus, 3000);
    checkStatus();
}

async function checkStatus() {
    try {
        const response = await fetch(`${API_BASE}/api/status/${currentTaskId}`);
        const data = await response.json();

        if (data.success) {
            if (data.state === 'success') {
                clearInterval(pollingInterval);
                showResult(data.resultUrl);
                hideStatus();
                document.getElementById('generateBtn').disabled = false;
            } else if (data.state === 'fail') {
                clearInterval(pollingInterval);
                showStatus('生成失败：' + data.failMsg, 'error');
                document.getElementById('generateBtn').disabled = false;
            }
        }
    } catch (error) {
        clearInterval(pollingInterval);
        showStatus('查询失败：' + error.message, 'error');
        document.getElementById('generateBtn').disabled = false;
    }
}

function showStatus(message, type) {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = `status ${type}`;
    status.classList.remove('hidden');
}

function hideStatus() {
    document.getElementById('status').classList.add('hidden');
}

function showResult(imageUrl) {
    const result = document.getElementById('result');
    const img = document.getElementById('resultImage');
    img.src = imageUrl;
    result.classList.remove('hidden');
}

function hideResult() {
    document.getElementById('result').classList.add('hidden');
}

function downloadImage() {
    const img = document.getElementById('resultImage');
    const link = document.createElement('a');
    link.href = img.src;
    link.download = '儿童识字小报.png';
    link.click();
}
