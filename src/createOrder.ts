import { useLayoutEffect, useCallback } from 'react'
import useWait from './useWait'

type AnyFn = (...args: any) => any
type Listener<F extends AnyFn> = (p: Promise<ReturnType<F>>, args: Parameters<F>) => void
type filterer<F extends AnyFn> = (...args: Parameters<F>) => boolean
type filter<F extends AnyFn> = filterer<F> | [filterer<F>, any[]]
interface WaitOpts<F extends AnyFn> { delay?: number, duration?: number, filter?: filter<F> }

export default function createOrder <Orderer extends AnyFn> (orderer: Orderer) {
    const listeners: Array<Listener<Orderer>> = []

    const order = (...args: Parameters<Orderer>) => {
        const promise = Promise.resolve(orderer(...args)) as Promise<ReturnType<Orderer>>
        listeners.forEach(fn => fn(promise, args))
        return promise
    }

    order.useWait = ({ delay= 0, duration= 0, filter= returnTrue }: WaitOpts<Orderer> = {}) => {
        if (typeof filter === 'function') filter = [filter, []]

        const filterer = useCallback(filter[0], filter[1])
        const [isWaiting, wait] = useWait({ delay, duration })

        useLayoutEffect(() => {
            const listener: Listener<Orderer> = (promise, args) => {
                if (filterer(...args)) {
                    wait(promise.catch(noop)) // tslint:disable-line: no-floating-promises
                }
            }

            listeners.push(listener)

            return () => {
                listeners.splice(listeners.indexOf(listener), 1)
            }
        }, [filterer])

        return isWaiting
    }

    return order
}

function returnTrue () { return true }

function noop () { } // tslint:disable-line: no-empty
