const CJK_PATTERN = /[぀-ヿ㐀-䶿一-鿿豈-﫿＀-￯]/

export function containsCjk(text: string): boolean {
  return CJK_PATTERN.test(text)
}
