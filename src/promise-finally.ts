export default function promiseFinally<T> (promise: Promise<T>, onFinally: () => void) {
    return promise.then(
        val => (onFinally(), val),
        err => (onFinally(), Promise.reject(err))
    )
}
