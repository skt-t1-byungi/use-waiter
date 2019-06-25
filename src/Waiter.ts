import { useMemo, useState, useLayoutEffect } from 'react'
import createDuration from 'rsup-duration'
import { WaitOpts, Order, AnyFn } from './types'

export default class Waiter {
    private _count = 0
    private _listeners: AnyFn[] = []

    constructor () {
        this.wait = this.wait.bind(this)
        this.useWait = this.useWait.bind(this)
    }

    get isWaiting () {
        return this._count > 0
    }

    private _emit () {
        this._listeners.forEach(fn => fn())
    }

    public subscribe (listener: AnyFn) {
        this._listeners.push(listener)
        return () => {
            this._listeners.splice(this._listeners.indexOf(listener), 1)
        }
    }

    public wait <T> (order: Order<T>) {
        if (typeof order === 'function') order = Promise.resolve(order())

        if (++this._count === 1) this._emit()

        const onFinally = () => {
            if (--this._count === 0) this._emit()
        }

        return Promise.resolve(order).then(v => (onFinally(), v), err => (onFinally(), Promise.reject(err)))
    }

    // tslint:disable-next-line: cognitive-complexity
    public useWait ({ delay= 0, duration= 0 }: WaitOpts= {}) {
        const [isWaiting, setWaiting] = useState(this.isWaiting)

        const unsubscribe = useMemo(() => {
            const delayer = delay > 0 ? createDuration(delay) : null
            const persister = duration > 0 ? createDuration(duration) : null

            let next: boolean | null = null
            let unmounted = false

            const unsubscribe = this.subscribe(() => {
                if ((delayer && delayer.isDuring) || (persister && persister.isDuring)) {
                    next = this.isWaiting
                    return
                }

                if (this.isWaiting) {
                    if (delayer) {
                        next = true
                        delayer.start().then(afterDelay)
                    } else {
                        startWaiting()
                    }
                } else {
                    setWaiting(false)
                }
            })

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

        useLayoutEffect(() => unsubscribe, [unsubscribe])

        return isWaiting
    }
}
