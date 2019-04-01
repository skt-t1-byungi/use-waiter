import createDuration from 'rsup-duration'
import { useLayoutEffect, useRef, useState } from 'react'

export class Waiter {
    private _pending: Record<string, number> = Object.create(null)
    private _listeners: Record<string, Array<() => void>> = Object.create(null)

    constructor () {
        this.useWait = this.useWait.bind(this)
    }

    public isPending (order: string) {
        return order in this._pending
    }

    public promise<T> (order: string, promise: Promise<T> | (() => Promise<T>)) {
        if (typeof order !== 'string') {
            throw new TypeError(`Expected "order" to be of type "string", but "${typeof order}".`)
        }

        if (typeof promise === 'function') promise = promise()

        if (!promise || typeof promise.then !== 'function') {
            throw new TypeError(`Expected "promise" to be thenable.`)
        }

        if (this.isPending(order)) {
            this._pending[order]++
        } else {
            this._pending[order] = 1
            this._emit(order)
        }

        const onFinally = () => {
            if (--this._pending[order] > 0) return
            delete this._pending[order]
            this._emit(order)
        }

        promise.then(onFinally, onFinally)

        return promise
    }

    private _emit (order: string) {
        (this._listeners[order] || []).forEach(fn => fn())
    }

    private _subscribe (order: string, listener: () => void) {
        if (!(order in this._listeners)) this._listeners[order] = []

        const listeners = this._listeners[order]
        listeners.push(listener)

        return () => {
            listeners.splice(listeners.indexOf(listener), 1)
            if (listeners.length === 0) delete this._listeners[order]
        }
    }

    // tslint:disable-next-line: cognitive-complexity
    public useWait (order: string, { delay= 0, duration = 0 } = {}) {
        const [isWaiting, setWaiting] = useState(this.isPending(order))
        const prevRef = useRef(isWaiting)

        useLayoutEffect(() => { prevRef.current = isWaiting }, [isWaiting])

        useLayoutEffect(() => {
            const delayer = delay > 0 ? createDuration(delay) : null
            const persister = duration > 0 ? createDuration(duration) : null

            let next: boolean | null = null
            let unmounted = false

            if (isWaiting && persister) {
                persister.start().then(afterDuration)
            }

            const listener = () => {
                const curr = this.isPending(order)
                const prev = prevRef.current

                if ((delayer && delayer.isDuring) || (persister && persister.isDuring)) {
                    next = curr
                    return
                }

                if (curr === prev) return

                if (curr) {
                    if (delayer) {
                        next = true
                        delayer.start().then(afterDelay)
                    } else {
                        startWaiting()
                    }
                } else {
                    setWaiting(false)
                }
            }

            const unsubscribe = this._subscribe(order, listener)

            return () => {
                unmounted = true
                unsubscribe()
            }

            function startWaiting () {
                setWaiting(true)
                if (persister) persister.start().then(afterDuration)
            }

            function afterDelay () {
                if (unmounted) return
                if (next === true) startWaiting()
                next = null
            }

            function afterDuration () {
                if (unmounted) return
                if (next === false) setWaiting(false)
                next = null
            }
        }, [delay, duration])

        return isWaiting
    }
}

export const createWaiter = () => new Waiter()

export default createWaiter
