const API_BASE = 'https://api.kie.ai/api/v1/jobs';
let currentTaskId = null;
let pollingInterval = null;

function buildPrompt(theme, title) {
    const vocab = VOCABULARY[theme];
    if (!vocab) throw new Error('主题不存在');

    let prompt = PROMPT_TEMPLATE;
    prompt = prompt.replace(/\{\{主题\}\}/g, theme);
    prompt = prompt.replace(/\{\{标题\}\}/g, title);
    prompt = prompt.replace(/\{\{核心词汇\}\}/g, vocab.core.join(', '));
    prompt = prompt.replace(/\{\{物品词汇\}\}/g, vocab.items.join(', '));
    prompt = prompt.replace(/\{\{环境词汇\}\}/g, vocab.environment.join(', '));

    return prompt;
}

async function generatePoster() {
    const apiKey = document.getElementById('apiKey').value.trim();
    const theme = document.getElementById('theme').value;
    const title = document.getElementById('title').value.trim();

    if (!apiKey) {
        showStatus('请输入 API Key', 'error');
        return;
    }

    if (!theme || !title) {
        showStatus('请填写完整信息', 'error');
        return;
    }

    const btn = document.getElementById('generateBtn');
    btn.disabled = true;
    hideResult();
    showStatus('正在创建任务...', 'loading');

    try {
        const prompt = buildPrompt(theme, title);

        const response = await fetch(`${API_BASE}/createTask`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'nano-banana-pro',
                input: {
                    prompt,
                    aspect_ratio: '2:3',
                    resolution: '4K',
                    output_format: 'png',
                    image_input: []
                }
            })
        });

        const data = await response.json();

        if (data.code === 200) {
            currentTaskId = data.data.taskId;
            showStatus('任务已创建，正在生成中...', 'loading');
            startPolling(apiKey);
        } else {
            showStatus('创建失败：' + data.msg, 'error');
            btn.disabled = false;
        }
    } catch (error) {
        showStatus('请求失败：' + error.message, 'error');
        btn.disabled = false;
    }
}

function startPolling(apiKey) {
    pollingInterval = setInterval(() => checkStatus(apiKey), 3000);
    checkStatus(apiKey);
}

async function checkStatus(apiKey) {
    try {
        const response = await fetch(`${API_BASE}/recordInfo?taskId=${currentTaskId}`, {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });

        const data = await response.json();

        if (data.code === 200) {
            const state = data.data.state;

            if (state === 'success') {
                clearInterval(pollingInterval);
                const result = JSON.parse(data.data.resultJson);
                showResult(result.resultUrls[0]);
                hideStatus();
                document.getElementById('generateBtn').disabled = false;
            } else if (state === 'fail') {
                clearInterval(pollingInterval);
                showStatus('生成失败：' + data.data.failMsg, 'error');
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
