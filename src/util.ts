import { AnyFn } from './types'

export function pFinally<R> (promise: Promise<R>, onFinally: AnyFn) {
    return Promise.resolve(promise).then(
        v => (onFinally(), v),
        err => (onFinally(), Promise.reject(err))
    )
}
