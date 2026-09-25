export type Result<Value, ErrorValue = string> =
  | { ok: true; data: Value }
  | { ok: false; error: ErrorValue }

export function ok<Value, ErrorValue = string>(data: Value): Result<Value, ErrorValue> {
  return { ok: true, data }
}

export function error<Value, ErrorValue = string>(error: ErrorValue): Result<Value, ErrorValue> {
  return { ok: false, error }
}
