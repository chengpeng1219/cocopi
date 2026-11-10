export function extractPythonCode(rawContent) {
  const raw = String(rawContent || '').trim();
  const codeMatch = raw.match(/```(?:python)?\s*([\s\S]*?)```/i);
  return (codeMatch ? codeMatch[1] : raw).trim();
}

export async function requestMaixPyCode(
  prompt,
  { signal, previousCode = '', deviceError = '' } = {}
) {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ prompt, previousCode, deviceError }),
    signal
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch (_) {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(payload?.error || `AI service HTTP ${response.status}`);
  }

  const content = payload?.content || '';
  if (!content) {
    throw new Error('AI service returned an empty response');
  }

  return {
    content,
    code: payload?.code || extractPythonCode(content),
    model: payload?.model || '',
    validation: payload?.validation || null,
    templates: payload?.templates || [],
    references: payload?.references || []
  };
}

