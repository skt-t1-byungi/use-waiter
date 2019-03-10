export function hasOwn<T extends object> (obj: T, prop: string) {
    return Object.prototype.hasOwnProperty.call(obj, prop)
}
