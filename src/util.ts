export function hasOwn<T extends object> (obj: T, prop: string) {
    return Object.prototype.hasOwnProperty.call(obj, prop)
}

export function promiseFinally<T> (promise: Promise<T>, onFinally: () => void) {
    return promise.then(
        val => (onFinally(), val),
        err => (onFinally(), Promise.reject(err))
    )
}

export function forIn<T extends object> (obj: T, fn: (v: T[Extract<keyof T, string>], k: Extract<keyof T, string>) => void) {
    for (const k in obj) {
        if (hasOwn(obj, k)) fn(obj[k], k)
    }
}

export function assertType (val: any, name: string, expected: string) {
    const type = typeof val
    if (type !== expected) throw new TypeError(`Expected ${name} to be of type "${expected}", but "${type}".`)
}
