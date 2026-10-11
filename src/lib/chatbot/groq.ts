// Minimal streaming client for Groq's OpenAI-compatible chat completions API. Server-side only: the API key is
// read from the environment by the caller and never leaves the server.

export type ToolCall = { id: string; name: string; arguments: string }

export type GroqMessage =
  | { role: 'system' | 'user'; content: string }
  | { role: 'assistant'; content: string | null; tool_calls?: { id: string; type: 'function'; function: { name: string; arguments: string } }[] }
  | { role: 'tool'; tool_call_id: string; content: string }

export type GroqTool = {
  type: 'function'
  function: { name: string; description: string; parameters: Record<string, unknown> }
}

export type GroqEvent = { type: 'token'; text: string } | { type: 'tool_calls'; calls: ToolCall[] } | { type: 'done' }

export class GroqError extends Error {
  constructor(
    message: string,
    /** HTTP status, or 0 for a network failure / timeout. */
    readonly status: number,
  ) {
    super(message)
  }
  /** Rate limited or overloaded on Groq's side: worth a gentle "try again in a moment". */
  get busy() {
    return this.status === 429 || this.status === 503 || this.status === 529
  }
}

export type StreamArgs = {
  baseUrl: string
  apiKey: string
  model: string
  messages: GroqMessage[]
  tools?: GroqTool[]
  maxTokens: number
  fetchImpl?: typeof fetch
  timeoutMs?: number
}

export async function* streamCompletion({ baseUrl, apiKey, model, messages, tools, maxTokens, fetchImpl = fetch, timeoutMs = 30_000 }: StreamArgs): AsyncGenerator<GroqEvent> {
  let response: Response
  try {
    response = await fetchImpl(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        temperature: 0.3,
        max_tokens: maxTokens,
        ...(tools?.length ? { tools, tool_choice: 'auto' } : {}),
        // gpt-oss models "think" first; a low effort keeps replies fast and cheap.
        ...(/gpt-oss/i.test(model) ? { reasoning_effort: 'low' } : {}),
      }),
      signal: AbortSignal.timeout(timeoutMs),
    })
  } catch (error) {
    throw new GroqError(error instanceof Error ? error.message : 'network error', 0)
  }
  // Never put the response body in the error: it could echo request data. The status is enough.
  if (!response.ok) throw new GroqError(`Groq returned HTTP ${response.status}`, response.status)
  if (!response.body) throw new GroqError('Groq returned no body', 0)

  const calls = new Map<number, ToolCall>()
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  try {
    for (;;) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      let newline: number
      while ((newline = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, newline).trim()
        buffer = buffer.slice(newline + 1)
        if (!line.startsWith('data:')) continue
        const data = line.slice(5).trim()
        if (data === '[DONE]') continue
        let chunk: { choices?: { delta?: { content?: string | null; tool_calls?: { index: number; id?: string; function?: { name?: string; arguments?: string } }[] } }[] }
        try {
          chunk = JSON.parse(data)
        } catch {
          continue
        }
        const delta = chunk.choices?.[0]?.delta
        if (delta?.content) yield { type: 'token', text: delta.content }
        for (const call of delta?.tool_calls ?? []) {
          const current = calls.get(call.index) ?? { id: '', name: '', arguments: '' }
          if (call.id) current.id = call.id
          if (call.function?.name) current.name += call.function.name
          if (call.function?.arguments) current.arguments += call.function.arguments
          calls.set(call.index, current)
        }
      }
    }
  } catch (error) {
    throw new GroqError(error instanceof Error ? error.message : 'stream interrupted', 0)
  }
  if (calls.size) yield { type: 'tool_calls', calls: [...calls.values()].map((call, i) => ({ ...call, id: call.id || `call_${i}` })) }
  yield { type: 'done' }
}
