import { useLayoutEffect, useRef, useState } from 'react'
import duration from 'rsup-duration'
import promiseFinally from './promise-finally'
import Reserver, { ReserveOptions } from './Reserver'

export default class Waiter {
    private _reserver = new Reserver()
    private _pending: Record<string, number> = Object.create(null)
    private _listeners: Record<string, Array<() => void>> = Object.create(null)

    constructor () {
        this.useWaiter = this.useWaiter.bind(this)
    }

    public reserve (name: string, runner: () => void, opts: Partial<ReserveOptions> = {}) {
        this._reserver.reserve(name, runner, opts)
    }

    public hasReserve (name: string) {
        return this._reserver.has(name)
    }

    public isWaiting (name: string) {
        return name in this._pending
    }

    public order <T = void> (name: string, promise?: Promise<T>) {
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
        if (!(name in this._listeners)) this._listeners[name] = []
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
