import { Order } from './types'

export default function orderFinally<T> (order: Order<T>, onFinally: () => void) {
    const promise = Promise.resolve(typeof order === 'function' ? order() : order)
    promise.then(onFinally, onFinally)
    return promise
}
