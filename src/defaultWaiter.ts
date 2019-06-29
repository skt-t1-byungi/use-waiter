import Waiter from './Waiter'
import { WaitOpts, Order } from './types'

const waiter = new Waiter()

export function isWaiting (name: string | number) {
    return waiter.isWaiting(name)
}

export function useWait (name: string | number, opts: WaitOpts = {}) {
    return waiter.useWait(name, opts)
}

export function wait <T> (name: string | number, order: Order<T>) {
    return waiter.wait(name, order)
}
