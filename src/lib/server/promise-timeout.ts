export async function withTimeout<Value>(
  promise: Promise<Value>,
  timeoutMilliseconds: number,
  message: string,
): Promise<Value> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), timeoutMilliseconds)
  })

  try {
    return await Promise.race([promise, timeout])
  } finally {
    clearTimeout(timeoutId)
  }
}
