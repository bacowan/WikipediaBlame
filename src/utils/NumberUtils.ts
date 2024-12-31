export function Clip(val: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, val));
}