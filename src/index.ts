import duration from 'rsup-duration'
import { useEffect, useRef, useState } from 'react'

type WaitListener = (isWaiting: boolean) => void

export class Waiter {
    private _pending: Record<string, number> = Object.create(null)
    private _listeners: Record<string, WaitListener[]> = Object.create(null)

    constructor () {
        this.useWait = this.useWait.bind(this)
    }

    public isWaiting (name: string) {
        return name in this._pending
    }

    public promise<T> (name: string, promise: Promise<T>) {
        assertType('name', 'string', name)

        if (!promise || typeof promise.then !== 'function') {
            throw new TypeError(`Expected "promise" to be thenable.`)
        }

        if (this.isWaiting(name)) {
            this._pending[name]++
        } else {
            this._pending[name] = 1
            this.trigger(name)
        }

        const onFinally = () => {
            if (--this._pending[name] > 0) return
            delete this._pending[name]
            this.trigger(name)
        }

        promise.then(onFinally, onFinally)

        return promise
    }

    public trigger (name: string) {
        assertType('name', 'string', name);
        (this._listeners[name] || []).forEach(fn => fn(this.isWaiting(name)))
    }

    public on (name: string, listener: WaitListener) {
        assertType('name', 'string', name)
        assertType('listener', 'function', listener)

        if (!(name in this._listeners)) this._listeners[name] = []

        const listeners = this._listeners[name]
        listeners.push(listener)

        return () => {
            listeners.splice(listeners.indexOf(listener), 1)
            if (listeners.length === 0) delete this._listeners[name]
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

            const listener = (curr: boolean) => {
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

            const off = this.on(name, listener)

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
