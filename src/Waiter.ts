import { useLayoutEffect, useRef, useState } from 'react'
import duration from 'rsup-duration'
import Reserver, { ReservedWorker, ReserveOptions } from './Reserver'
import { assertType, forIn, hasOwn, promiseFinally } from './util'

export interface ReserveMap {
    [name: string]: ReservedWorker | [ReservedWorker] | [ReservedWorker, ReserveOptions]
}

export default class Waiter {
    private _reserver = new Reserver()
    private _pending: Record<string, number> = {}
    private _listeners: Record<string, Array<() => void>> = {}

    constructor () {
        this.useWait = this.useWait.bind(this)
    }

    public reserve (reserves: ReserveMap): void
    public reserve (name: string, worker: ReservedWorker, opts?: ReserveOptions): void
    public reserve (name: string | ReserveMap, worker?: ReservedWorker, opts?: ReserveOptions) {
        if (typeof name === 'object') {
            forIn(name, (val, k) => {
                if (typeof val === 'function') val = [val]
                this.reserve(k, val[0], val[1])
            })
            return
        }

        assertType(name, 'name', 'string')
        assertType(worker, 'runner', 'function')

        this._reserver.reserve(name, worker!, opts)
    }

    public isReserved (name: string) {
        return this._reserver.has(name)
    }

    public isWaiting (name: string) {
        return hasOwn(this._pending, name)
    }

    public order <T = void> (name: string, promise?: Promise<T>) {
        if (!promise) {
            if (!this.isReserved(name)) throw new TypeError(`No reservations for "${name}"`)
            promise = this._reserver.order(name)
        }

        if (this.isWaiting(name)) {
            this._pending[name]++
        } else {
            this._pending[name] = 1
            this._emit(name)
        }

        return promiseFinally(promise, () => {
            if (--this._pending[name] > 0) return
            delete this._pending[name]
            this._emit(name)
        })
    }

    private _emit (name: string) {
        (this._listeners[name] || []).forEach(fn => fn())
    }

    private _addListener (name: string, listener: () => void) {
        if (!hasOwn(this._listeners, name)) this._listeners[name] = []
        this._listeners[name].push(listener)
    }

    private _removeListener (name: string, listener: () => void) {
        const listeners = this._listeners[name].filter(fn => fn === listener)

        if (listeners.length > 0) {
            this._listeners[name] = listeners
        } else {
            delete this._listeners[name]
        }
    }

    public useWait (name: string, { delay= 0, persist = 0 } = {}) {
        const [isWaiting, setWaiting] = useState(this.isWaiting(name))
        const prevRef = useRef(isWaiting)

        useLayoutEffect(() => { prevRef.current = isWaiting }, [isWaiting])

        useLayoutEffect(() => {
            const delayer = duration(delay)
            const persister = duration(persist)
            let next: boolean | null = null
            let unmounted = false

            const listener = () => {
                const curr = this.isWaiting(name)
                const prev = prevRef.current

                if (curr === prev) return

                if (delayer.isDuring || persister.isDuring) {
                    next = curr
                    return
                }

                if (curr) {
                    delayer.start().then(() => {
                        if (unmounted) return
                        setWaiting(true)
                        persister.start().then(() => {
                            if (unmounted) return
                            if (next === false) setWaiting(false)
                        })
                    })
                } else {
                    setWaiting(false)
                }
            }

            this._addListener(name, listener)

            return () => {
                unmounted = true
                this._removeListener(name, listener)
            }
        }, [delay, persist])

        return isWaiting
    }
}
