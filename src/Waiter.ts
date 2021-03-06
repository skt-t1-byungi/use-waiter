import SingleWaiter from './SingleWaiter'
import { useLayoutEffect } from 'react'
import { WaitOpts, Order } from './types'
import promiseFinally from './promiseFinally'

export default class Waiter {
    private _waiters: Record<string, SingleWaiter> = Object.create(null)

    constructor () {
        this.wait = this.wait.bind(this)
        this.useWait = this.useWait.bind(this)
    }

    isWaiting (name: string | number) {
        return Boolean(this._waiters[name] && this._waiters[name].isWaiting)
    }

    private _getWaiter (name: string | number) {
        return this._waiters[name] || (this._waiters[name] = new SingleWaiter())
    }

    wait <T> (name: string | number, order: Order<T>) {
        const waiter = this._getWaiter(name)

        return promiseFinally(waiter.wait(order), () => {
            if (!waiter.isInUse) delete this._waiters[name]
        })
    }

    useWait (name: string | number, opts: WaitOpts = {}) {
        const waiter = this._getWaiter(name)
        const isWaiting = waiter.useWait(opts)

        useLayoutEffect(() => () => {
            if (!waiter.isInUse) delete this._waiters[name]
        }, [name, waiter.isInUse])

        return isWaiting
    }
}
