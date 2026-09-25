export type RetryPolicy = {
  attempts: number
  delayMilliseconds: number
}

type RetryContext = {
  send: () => Promise<Response>
  policy: RetryPolicy
}

type SendOutcome = { ok: true; response: Response } | { ok: false; failure: unknown }

async function sendOnce(context: RetryContext): Promise<SendOutcome> {
  try {
    const response = await context.send()
    if (response.ok) return { ok: true, response }
    return { ok: false, failure: new Error(`Request failed with status ${response.status}`) }
  } catch (error) {
    return { ok: false, failure: error }
  }
}

async function handleFailure(
  context: RetryContext,
  attempt: number,
  failure: unknown,
): Promise<Response> {
  if (attempt >= context.policy.attempts) {
    throw failure instanceof Error ? failure : new Error('Request failed after retries')
  }

  await delay(context.policy.delayMilliseconds)
  return attemptRequest(context, attempt + 1)
}

async function attemptRequest(context: RetryContext, attempt: number): Promise<Response> {
  const outcome = await sendOnce(context)
  if (outcome.ok) return outcome.response

  return handleFailure(context, attempt, outcome.failure)
}

export function requestWithRetries(
  send: () => Promise<Response>,
  policy: RetryPolicy,
): Promise<Response> {
  return attemptRequest({ send, policy }, 1)
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}
