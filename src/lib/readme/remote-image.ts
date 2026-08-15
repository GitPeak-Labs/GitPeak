export async function fetchAsDataUri(
  url: string | null | undefined,
  timeoutMilliseconds = 3000,
): Promise<string> {
  if (!url) return ''

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMilliseconds) })
    if (!response.ok) return ''

    const contentType = response.headers.get('content-type') || 'image/png'
    const buffer = await response.arrayBuffer()
    return `data:${contentType};base64,${Buffer.from(buffer).toString('base64')}`
  } catch {
    return ''
  }
}
