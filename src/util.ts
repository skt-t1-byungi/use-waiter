import { AnyFn, EnsurePromise } from './types'

export function pFinally<T> (p: T, onFinally: AnyFn) {
    return Promise.resolve(p).then(v => (onFinally(),v), err => (onFinally(),Promise.reject(err))) as EnsurePromise<T>
}
