export function hasOwn <T extends object> (o: T, k: string): k is Extract<keyof T, string> {
    return Object.prototype.hasOwnProperty.call(o, k)
}
