const fs = require('fs');
const path = require('path');

const vocabularyData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/vocabulary.json'), 'utf-8')
);

function getVocabulary(theme) {
  if (!vocabularyData[theme]) {
    throw new Error(`主题 "${theme}" 不存在`);
  }
  return vocabularyData[theme];
}

function getAllThemes() {
  return Object.keys(vocabularyData);
}

module.exports = { getVocabulary, getAllThemes };
