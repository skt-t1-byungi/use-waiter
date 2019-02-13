import Deferred from 'p-state-defer'
import { useLayoutEffect, useRef, useState } from 'react'
import createDuration, { duration } from 'rsup-duration'
import { hasOwn } from './util'

type ReserveRunner = () => any
interface ReserveOptions { concurrency: number}

export default class Waiter {
    private _reverses: Record<string, [ReserveRunner, ReserveOptions]> = {}
    private _orderCount: Record<string, number> = {}
    private _reservedOrderCount: Record<string, number> = {}
    private _queues: Record<string, Array<Deferred<any>>> = {}
    private _listeners: Record<string, Array<() => void>> = {}

    constructor () {
        this.useWaiter = this.useWaiter.bind(this)
    }

    public reserve (
        name: string,
        runner: ReserveRunner,
        { concurrency = Infinity }: Partial<ReserveOptions> = {}
    ) {
        this._reverses[name] = [runner, { concurrency }]
    }

    public hasReserve (name: string) {
        return hasOwn(this._reverses, name)
    }

    public isWaiting (name: string) {
        return hasOwn(this._orderCount, name)
    }

    public order <T> (name: string, promise?: Promise<T>) {
        if (!promise) {
            if (!this.hasReserve(name)) throw new TypeError(`No reservations for "${name}"`)
            promise = this._makeOrderByReserve(name)
        }

        if (this.isWaiting(name)) {
            this._orderCount[name]++
        } else {
            this._orderCount[name] = 1
            this._emitWaitingState(name)
        }

        const onFinally = () => {
            if (--this._orderCount[name] === 0) {
                delete this._orderCount[name]
                this._emitWaitingState(name)
            }
        }

        return promise.then(
            val => (onFinally(), val),
            err => (onFinally(), Promise.reject(err))
        )
    }

    public _emitWaitingState (name: string) {
        (this._listeners[name] || []).forEach(fn => fn())
    }

    public _makeOrderByReserve <T> (name: string, defer?: Deferred<T>) {
        if (!defer) defer = new Deferred()

        const [runner, { concurrency }] = this._reverses[name]
        const count = this._reservedOrderCount[name] || 0

        if (count === concurrency) {
            (this._queues[name] || (this._queues[name] = [])).push(defer)
            return defer.promise
        }

        this._reservedOrderCount[name] = count + 1

        const onFinally = () => {
            if (--this._reservedOrderCount[name] === 0) delete this._reservedOrderCount[name]

            const queue = this._queues[name]
            if (!queue) return

            const defer = queue.shift()
            if (queue.length === 0) delete this._queues[name]

            this._makeOrderByReserve(name, defer)
        }

        Promise.resolve(runner()).then(
            val => {
                onFinally()
                defer!.resolve(val)
            },
            err => {
                onFinally()
                defer!.reject(err)
            })

        return defer.promise
    }

    public useWaiter (name: string, { delay= 0, persist = 0 } = {}) {
        const [isWaiting, setWaiting] = useState(this.isWaiting(name))
        const prevRef = useRef(isWaiting)

        useLayoutEffect(() => {
            prevRef.current = isWaiting
        }, [isWaiting])

        useLayoutEffect(() => {
            const delayer = createDuration(delay)
            const persister = createDuration(delay + persist)

            const listener = () => {
                const curr = this.isWaiting(name)
                const prev = prevRef.current

                if (curr === prev) return
            }

            (this._listeners[name] || (this._listeners[name] = [])).push(listener)

            return () => {
                const listeners = this._listeners[name].filter(fn => fn === listener)

                if (listeners.length > 0) {
                    this._listeners[name] = listeners
                } else {
                    delete this._listeners[name]
                }
            }
        }, [delay, duration])

        return isWaiting
    }
}
