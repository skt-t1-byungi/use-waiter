export function hasOwn <T extends object> (o: T, k: string): k is Extract<keyof T, string> {
    return Object.prototype.hasOwnProperty.call(o, k)
}

export function pFinally<T> (promise: Promise<T>, onFinally: () => void) {
    return promise.then(
        val => (onFinally(), val),
        err => (onFinally(), Promise.reject(err))
    )
}
