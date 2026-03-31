const axios = require('axios');

const API_BASE_URL = 'https://api.kie.ai/api/v1/jobs';
const API_KEY = process.env.API_KEY;

async function createTask(prompt, options = {}) {
  const response = await axios.post(
    `${API_BASE_URL}/createTask`,
    {
      model: 'nano-banana-pro',
      input: {
        prompt,
        aspect_ratio: options.aspect_ratio || '2:3',
        resolution: options.resolution || '4K',
        output_format: options.output_format || 'png',
        image_input: []
      }
    },
    {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data.data.taskId;
}

async function queryTask(taskId) {
  const response = await axios.get(
    `${API_BASE_URL}/recordInfo?taskId=${taskId}`,
    {
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    }
  );

  const data = response.data.data;

  return {
    state: data.state,
    resultJson: data.resultJson ? JSON.parse(data.resultJson) : null,
    failMsg: data.failMsg
  };
}

module.exports = { createTask, queryTask };
