require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { getVocabulary, getAllThemes } = require('./modules/vocabularyGenerator');
const { buildPrompt } = require('./modules/promptBuilder');
const { createTask, queryTask } = require('./modules/apiClient');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// 获取所有主题
app.get('/api/themes', (req, res) => {
  try {
    const themes = getAllThemes();
    res.json({ success: true, themes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 生成小报
app.post('/api/generate', async (req, res) => {
  try {
    const { theme, title } = req.body;

    if (!theme || !title) {
      return res.status(400).json({ success: false, error: '主题和标题不能为空' });
    }

    const vocabulary = getVocabulary(theme);
    const prompt = buildPrompt(theme, title, vocabulary);
    const taskId = await createTask(prompt);

    res.json({ success: true, taskId, message: '任务已创建' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 查询任务状态
app.get('/api/status/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const result = await queryTask(taskId);

    const response = {
      success: true,
      state: result.state
    };

    if (result.state === 'success' && result.resultJson) {
      response.resultUrl = result.resultJson.resultUrls[0];
    } else if (result.state === 'fail') {
      response.failMsg = result.failMsg;
    }

    res.json(response);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
