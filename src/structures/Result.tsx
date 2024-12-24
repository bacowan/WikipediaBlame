export type Ok<T> = { ok: true, value: T };
export type Err<E> = { ok: false, error: E };
export type Result<T, E> = Ok<T> | Err<E>;
export function Ok<T>(value: T): Ok<T> {
    return { ok: true, value };
}
export function Err<T>(error: T): Err<T> {
    return { ok: false, error };
}