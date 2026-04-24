const express = require('express');
const router = express.Router();
const { callOpenRouter } = require('./helpers');

router.post('/', async (req, res) => {
  try {
    const { orders, availableResources, constraints } = req.body;
    const systemPrompt = `You are a translation operations optimizer.
Optimize order scheduling, resource allocation, and batch processing for translation workflows.
Respond with JSON: { "optimizedSchedule": [{"batch": 1, "orders": ["..."], "assignedTo": "...", "startDate": "...", "endDate": "..."}], "costSavings": "...", "priorityFlags": ["..."], "bottlenecks": ["..."], "timelineFeasibility": "...", "recommendations": ["..."] }`;

    const prompt = `Optimize the scheduling and resource allocation for these translation orders.
Orders: ${JSON.stringify(orders) || 'not provided'}
Available resources: ${JSON.stringify(availableResources) || 'not provided'}
Constraints: ${JSON.stringify(constraints) || 'none'}`;

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
    return { optimizedSchedule: [], costSavings: '', priorityFlags: [], bottlenecks: [], timelineFeasibility: text, recommendations: [] };
  } catch {
    return { optimizedSchedule: [], costSavings: '', priorityFlags: [], bottlenecks: [], timelineFeasibility: text, recommendations: [] };
  }
}

module.exports = router;
