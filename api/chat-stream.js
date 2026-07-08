export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { systemPrompt, userPrompt, model, temperature, maxTokens, topP } = req.body;

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: model || 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: temperature ?? 0.7,
        max_tokens: maxTokens ?? 4096,
        top_p: topP ?? 1,
        stream: true
      })
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(response.status).json({ error: error });
    }

    // 设置 SSE 响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // 将 DeepSeek 的流式响应转发给客户端
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        res.write(chunk);
      }
    } catch (streamError) {
      console.error('Stream read error:', streamError);
    } finally {
      reader.releaseLock();
      res.end();
    }

  } catch (error) {
    console.error('DeepSeek Stream API Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }
}
