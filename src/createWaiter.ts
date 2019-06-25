import { useMemo, useState, useLayoutEffect } from 'react'
import createDuration from 'rsup-duration'
import { WaitOpts, Order, AnyFn } from './types'

export class Waiter {
    private _countsMap: Record<string, number> = Object.create(null)
    private _listenersMap: Record<string, AnyFn[]> = Object.create(null)

    constructor () {
        this.wait = this.wait.bind(this)
        this.useWait = this.useWait.bind(this)
    }

    public isWaiting (name: string | number) {
        return name in this._countsMap
    }

    private _emit (name: string | number) {
        (this._listenersMap[name] || []).forEach(fn => fn())
    }

    private _subscribe (name: string | number, listener: AnyFn) {
        if (!(name in this._listenersMap)) this._listenersMap[name] = []

        const listeners = this._listenersMap[name]
        listeners.push(listener)

        return () => {
            listeners.splice(listeners.indexOf(listener), 1)
            if (listeners.length === 0) delete this._listenersMap[name]
        }
    }

    public wait <T> (name: string | number, order: Order<T>) {
        if (this.isWaiting(name)) {
            this._countsMap[name]++
        } else {
            this._countsMap[name] = 1
            this._emit(name)
        }

        const onFinally = () => {
            if (--this._countsMap[name] > 0) return
            delete this._countsMap[name]
            this._emit(name)
        }

        return Promise.resolve(typeof order === 'function' ? order() : order)
            .then(v => (onFinally(), v), err => (onFinally(), Promise.reject(err)))
    }

    // tslint:disable-next-line: cognitive-complexity
    public useWait (name: string | number, { delay= 0, duration= 0 }: WaitOpts= {}) {
        const [isWaiting, setWaiting] = useState(this.isWaiting(name))

        const memoUnSubscriber = useMemo(() => {
            const delayer = delay > 0 ? createDuration(delay) : null
            const persister = duration > 0 ? createDuration(duration) : null

            let next: boolean | null = null
            let unmounted = false

            const unsubscribe = this._subscribe(name, () => {
                if ((delayer && delayer.isDuring) || (persister && persister.isDuring)) {
                    next = this.isWaiting(name)
                    return
                }

                if (this.isWaiting(name)) {
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

export default () => new Waiter()
