import { Order, WaitOpts } from './types'
import { useState, useMemo, useLayoutEffect } from 'react'
import createDuration from 'rsup-duration'
import orderFinally from './orderFinally'

export default class SingleWaiter {
    private _count = 0
    private _listeners: Array<() => void> = []

    constructor () {
        this.wait = this.wait.bind(this)
        this.useWait = this.useWait.bind(this)
    }

    get isInUse () {
        return this.isWaiting || this._listeners.length > 0
    }

    get isWaiting () {
        return this._count > 0
    }

    private _emit () {
        this._listeners.forEach(fn => fn())
    }

    private _subscribe (listener: () => void) {
        this._listeners.push(listener)
        return () => {
            this._listeners.splice(this._listeners.indexOf(listener), 1)
        }
    }

    wait<T> (order: Order<T>) {
        if (++this._count === 1) this._emit()

        return orderFinally(order, () => {
            if (--this._count === 0) this._emit()
        })
    }

    // tslint:disable-next-line: cognitive-complexity
    useWait ({ delay = 0, duration = 0 }: WaitOpts = {}) {
        const [isWaiting, setWaiting] = useState(this.isWaiting)

        const memoUnSubscriber = useMemo(() => {
            const delayer = delay > 0 ? createDuration(delay) : null
            const persister = duration > 0 ? createDuration(duration) : null

            let next: boolean | null = null
            let unmounted = false

            if (isWaiting && persister) {
                persister.start().then(afterDuration)
            }

            const unsubscribe = this._subscribe(() => {
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

        useLayoutEffect(() => memoUnSubscriber, [memoUnSubscriber])

        return isWaiting
    }
}
