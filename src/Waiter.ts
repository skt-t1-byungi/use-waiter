import { useLayoutEffect, useRef, useState } from 'react'
import duration from 'rsup-duration'
import Reserver, { ReserveOptions } from './Reserver'
import { hasOwn, pFinally } from './util'

export default class Waiter {
    private _reserver = new Reserver()
    private _pending: Record<string, number> = {}
    private _listeners: Record<string, Array<() => void>> = {}

    constructor () {
        this.useWaiter = this.useWaiter.bind(this)
    }

    public reserve (name: string, orderer: () => void, opts: Partial<ReserveOptions> = {}) {
        this._reserver.reserve(name, orderer, opts)
    }

    public hasReserve (name: string) {
        return this._reserver.has(name)
    }

    public isWaiting (name: string) {
        return hasOwn(this._pending, name)
    }

    public order <T> (name: string, promise?: Promise<T>) {
        if (!promise) {
            if (!this.hasReserve(name)) throw new TypeError(`No reservations for "${name}"`)
            promise = this._reserver.order(name)
        }

        if (this.isWaiting(name)) {
            this._pending[name]++
        } else {
            this._pending[name] = 1
            this._emit(name)
        }

        return pFinally(promise, () => {
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

    public useWaiter (name: string, { delay= 0, persist = 0 } = {}) {
        const [isWaiting, setWaiting] = useState(this.isWaiting(name))
        const prevRef = useRef(isWaiting)

        useLayoutEffect(() => { prevRef.current = isWaiting }, [isWaiting])

        useLayoutEffect(() => {
            const delayer = duration(delay)
            const persister = duration(persist)
            let next: boolean | null = null

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
                        setWaiting(true)
                        persister.start().then(() => {
                            if (next === false) {
                                next = null
                                setWaiting(false)
                            }
                        })
                    })
                } else {
                    setWaiting(false)
                }
            }

            this._addListener(name, listener)
            return () => this._removeListener(name, listener)
        }, [delay, persist])

        return isWaiting
    }
}
