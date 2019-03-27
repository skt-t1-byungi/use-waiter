import duration from 'rsup-duration'
import { useEffect, useRef, useState } from 'react'

type WaitListener = (data: any) => void

export class Waiter {
    private _pending: Record<string, number> = Object.create(null)
    private _listeners: Record<string, WaitListener[]> = Object.create(null)

    constructor () {
        this.useWait = this.useWait.bind(this)
    }

    public isPending (order: string) {
        return order in this._pending
    }

    public promise<T> (order: string, promise: Promise<T>) {
        assertType('order', 'string', order)

        if (!promise || typeof promise.then !== 'function') {
            throw new TypeError(`Expected "promise" to be thenable.`)
        }

        if (this.isPending(order)) {
            this._pending[order]++
        } else {
            this._pending[order] = 1
            this.trigger(order)
        }

        const onFinally = () => {
            if (--this._pending[order] > 0) return
            delete this._pending[order]
            this.trigger(order)
        }

        promise.then(onFinally, onFinally)

        return promise
    }

    public trigger (order: string, data?: any) {
        assertType('order', 'string', order);
        (this._listeners[order] || []).forEach(fn => fn(data))
    }

    public on (order: string, listener: WaitListener) {
        assertType('order', 'string', order)
        assertType('listener', 'function', listener)

        if (!(order in this._listeners)) this._listeners[order] = []

        const listeners = this._listeners[order]
        listeners.push(listener)

        return () => {
            listeners.splice(listeners.indexOf(listener), 1)
            if (listeners.length === 0) delete this._listeners[order]
        }
    }

    public wait (order: string) {
        return new Promise(resolve => {
            const off = this.on(order, () => {
                resolve()
                off()
            })
        })
    }

    // tslint:disable-next-line: cognitive-complexity
    public useWait (order: string, { delay= 0, persist = 0 } = {}) {
        const [isWaiting, setWaiting] = useState(this.isPending(order))
        const prevRef = useRef(isWaiting)

        useEffect(() => { prevRef.current = isWaiting }, [isWaiting])

        useEffect(() => {
            const delayer = duration(delay)
            const persister = duration(persist)

            let next: boolean | null = null
            let unmounted = false

            const startWaiting = () => {
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
            }

            if (isWaiting) startWaiting()

            const listener = () => {
                const curr = this.isPending(order)
                const prev = prevRef.current

                if (delayer.isDuring || persister.isDuring) {
                    next = curr
                    return
                }

                if (curr === prev) return

                if (curr) {
                    startWaiting()
                } else {
                    setWaiting(false)
                }
            }

            const off = this.on(order, listener)

            return () => {
                unmounted = true
                off()
            }
        }, [delay, persist])

        return isWaiting
    }
}

export const createWaiter = () => new Waiter()

export default createWaiter

function assertType<T> (name: string, expected: string, val: T) {
    const type = typeof val
    if (type !== expected) throw new TypeError(`Expected "${name}" to be of type "${expected}", but "${type}".`)
}
