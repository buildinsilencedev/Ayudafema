/**
 * Minimal OpenRouter chat-completions client.
 * Single entry point for all LLM calls so the model routing + headers
 * stay consistent across edge functions.
 */

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string | ContentPart[]
}

export interface ContentPart {
  type: 'text' | 'image_url'
  text?: string
  image_url?: { url: string }
}

export interface ChatParams {
  model: string
  messages: ChatMessage[]
  temperature?: number
  max_tokens?: number
}

/**
 * Call OpenRouter and return the assistant message content (string).
 * Throws on non-200 or missing choices.
 */
export async function openrouterChat(params: ChatParams): Promise<{
  content: string
  inputTokens: number
  outputTokens: number
}> {
  const apiKey = Deno.env.get('OPENROUTER_API_KEY')
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not configured')

  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer':  'https://ayudafema.org',
      'X-Title':       'Ayudafema — FEMA Appeal Assistant',
    },
    body: JSON.stringify({
      model:       params.model,
      messages:    params.messages,
      temperature: params.temperature ?? 0,
      max_tokens:  params.max_tokens  ?? 1024,
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '(unreadable)')
    throw new Error(`OpenRouter ${res.status}: ${body}`)
  }

  const json = await res.json()
  const choice = json.choices?.[0]
  if (!choice) throw new Error('OpenRouter returned no choices')

  return {
    content:      choice.message?.content ?? '',
    inputTokens:  json.usage?.prompt_tokens     ?? 0,
    outputTokens: json.usage?.completion_tokens ?? 0,
  }
}
