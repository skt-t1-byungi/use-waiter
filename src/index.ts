import duration from 'rsup-duration'
import { useEffect, useRef, useState } from 'react'

export class Waiter {
    private _pending: Record<string, number> = Object.create(null)
    private _listeners: Record<string, Array<() => void>> = Object.create(null)

    constructor () {
        this.useWait = this.useWait.bind(this)
    }

    public isWaiting (name: string) {
        return name in this._pending
    }

    public promise<T> (name: string, promise: Promise<T>) {
        if (this.isWaiting(name)) {
            this._pending[name]++
        } else {
            this._pending[name] = 1
            this._emit(name)
        }

        const onFinally = () => {
            if (--this._pending[name] > 0) return
            delete this._pending[name]
            this._emit(name)
        }

        promise.then(onFinally, onFinally)

        return promise
    }

    private _emit (name: string) {
        (this._listeners[name] || []).forEach(fn => fn())
    }

    private _addListener (name: string, listener: () => void) {
        if (!(name in this._listeners)) this._listeners[name] = []
        this._listeners[name].push(listener)
    }

    private _removeListener (name: string, listener: () => void) {
        const listeners = this._listeners[name].filter(fn => fn !== listener)

        if (listeners.length > 0) {
            this._listeners[name] = listeners
        } else {
            delete this._listeners[name]
        }
    }

    // tslint:disable-next-line: cognitive-complexity
    public useWait (name: string, { delay= 0, persist = 0 } = {}) {
        const [isWaiting, setWaiting] = useState(this.isWaiting(name))
        const prevRef = useRef(isWaiting)

        useEffect(() => { prevRef.current = isWaiting }, [isWaiting])

        useEffect(() => {
            const delayer = duration(delay)
            const persister = duration(persist)

            let next: boolean | null = null
            let unmounted = false

            const listener = () => {
                const curr = this.isWaiting(name)
                const prev = prevRef.current

                if (delayer.isDuring || persister.isDuring) {
                    next = curr
                    return
                }

                if (curr === prev) return

                if (curr) {
                    delayer.start().then(() => {
                        if (unmounted) return
                        if (next !== false) {
                            setWaiting(true)
                            persister.start().then(() => {
                                if (unmounted) return
                                if (next === false) setWaiting(false)
                                next = null
                            })
                        }
                        next = null
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

export const createWaiter = () => new Waiter()

export default createWaiter
