export async function withTimeout<Value>(
  promise: Promise<Value>,
  timeoutMilliseconds: number,
  message: string,
): Promise<Value> {
  const { promise: timeout, reject: rejectTimeout } = Promise.withResolvers<never>()
  const timeoutId = setTimeout(() => {
    rejectTimeout(new Error(message))
  }, timeoutMilliseconds)

  try {
    return await Promise.race([promise, timeout])
  } finally {
    clearTimeout(timeoutId)
  }
}
