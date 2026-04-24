const express = require('express');
const router = express.Router();
const { callOpenRouter } = require('./helpers');

router.post('/', async (req, res) => {
  try {
    const { invoiceData, period, targetRevenue, pricingModel } = req.body;
    const systemPrompt = `You are a financial analyst for a translation agency.
Analyze invoice data for: revenue trends, client profitability, payment patterns, pricing optimization opportunities, overdue risk prediction, and seasonal patterns.
Respond with JSON: { "revenueSummary": {"total": 45000, "average": 1500, "trend": "growing|stable|declining"}, "clientProfitability": [{"client": "...", "revenue": 12000, "profitMargin": 35, "paymentReliability": "excellent|good|poor"}], "anomalies": [{"invoice": "...", "issue": "...", "recommendation": "..."}], "overdueRisk": [{"invoice": "...", "riskLevel": "high|medium|low", "predictedPayDate": "..."}], "pricingRecommendations": [{"service": "...", "currentRate": "...", "suggestedRate": "...", "reasoning": "..."}], "forecast": {"nextMonth": 16000, "nextQuarter": 52000, "confidence": 0.75}, "recommendations": ["..."] }`;

    const prompt = `Analyze the following invoice data for a translation agency.
${period ? `Period: ${period}` : ''}
${targetRevenue ? `Revenue Target: ${targetRevenue}` : ''}
${pricingModel ? `Current Pricing Model: ${pricingModel}` : ''}

Invoice Data:
"""
${invoiceData}
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
    return { revenueSummary: {}, clientProfitability: [], anomalies: [], overdueRisk: [], pricingRecommendations: [], forecast: {}, recommendations: [text] };
  } catch {
    return { revenueSummary: {}, clientProfitability: [], anomalies: [], overdueRisk: [], pricingRecommendations: [], forecast: {}, recommendations: [text] };
  }
}

module.exports = router;
