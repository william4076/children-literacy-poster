const fs = require('fs');
const path = require('path');

const promptTemplate = fs.readFileSync(
  path.join(__dirname, '../../ai-docs/prompt.md'),
  'utf-8'
);

function buildPrompt(theme, title, vocabulary) {
  const lines = promptTemplate.split('\n');
  const startIdx = lines.findIndex(line => line.includes('```markdown'));

  if (startIdx === -1) throw new Error('模板格式错误');

  let prompt = lines.slice(startIdx + 1).join('\n');

  prompt = prompt.replace(/\{\{主题\/场景\}\}/g, theme);
  prompt = prompt.replace(/\{\{标题\}\}/g, title);

  const coreList = vocabulary.core.join(', ');
  const itemsList = vocabulary.items.join(', ');
  const envList = vocabulary.environment.join(', ');

  prompt = prompt.replace(/\{\{这里请列出你联想到的3-5个核心大词[^}]*\}\}/g, coreList);
  prompt = prompt.replace(/\{\{这里请列出你联想到的5-8个常用物品词[^}]*\}\}/g, itemsList);
  prompt = prompt.replace(/\{\{这里请列出你联想到的3-5个环境词[^}]*\}\}/g, envList);

  return prompt.trim();
}

module.exports = { buildPrompt };
