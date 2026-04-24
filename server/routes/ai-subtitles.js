const express = require('express');
const router = express.Router();
const { callOpenRouter } = require('./helpers');

router.post('/', async (req, res) => {
  try {
    const { text, sourceLanguage, targetLanguage, format, maxCharsPerLine, maxLinesPerSubtitle } = req.body;
    const systemPrompt = `You are a professional subtitling expert.
Create properly timed and formatted subtitles with translations.
Respond with JSON: { "subtitles": [{"index": 1, "startTime": "00:00:00,000", "endTime": "00:00:02,000", "sourceText": "...", "translatedText": "...", "charCount": 0, "readingSpeed": 0}], "totalSubtitles": 0, "avgCharsPerSubtitle": 0, "formattedOutput": "...", "issues": ["..."], "notes": "..." }`;

    const prompt = `Create translated subtitles from this text.
Source language: ${sourceLanguage || 'English'}
Target language: ${targetLanguage || 'Spanish'}
Format: ${format || 'SRT'}
Max characters per line: ${maxCharsPerLine || 42}
Max lines per subtitle: ${maxLinesPerSubtitle || 2}

Text:
"""
${text}
"""`;

    const result = await callOpenRouter(prompt, systemPrompt);
    res.json({ success: true, result: parseJSON(result) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function parseJSON(text) {
  try {
    const m = text.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
    return { subtitles: [], totalSubtitles: 0, avgCharsPerSubtitle: 0, formattedOutput: text, issues: [], notes: '' };
  } catch {
    return { subtitles: [], totalSubtitles: 0, avgCharsPerSubtitle: 0, formattedOutput: text, issues: [], notes: '' };
  }
}

module.exports = router;
