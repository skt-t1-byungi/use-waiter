import SingleWaiter from './SingleWaiter'
import { useLayoutEffect } from 'react'
import { WaitOpts, Order } from './types'
import orderFinally from './orderFinally'

export default class Waiter {
    private _waiters: Record<string, SingleWaiter> = Object.create(null)

    constructor () {
        this.wait = this.wait.bind(this)
        this.useWait = this.useWait.bind(this)
    }

    public isWaiting (name: string | number) {
        return Boolean(this._waiters[name] && this._waiters[name].isWaiting)
    }

    private _getWaiter (name: string | number) {
        return this._waiters[name] || (this._waiters[name] = new SingleWaiter())
    }

    public wait <T> (name: string | number, order: Order<T>) {
        const waiter = this._getWaiter(name)

        return orderFinally(waiter.wait(order), () => {
            if (!waiter.isInUse) delete this._waiters[name]
        })
    }

    public useWait (name: string | number, opts: WaitOpts= {}) {
        const waiter = this._getWaiter(name)
        const isWaiting = waiter.useWait(opts)

        useLayoutEffect(() => () => {
            if (!waiter.isInUse) delete this._waiters[name]
        }, [])

        return isWaiting
    }
}
