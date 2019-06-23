import { useLayoutEffect, useCallback } from 'react'
import useWait from './useWait'
import { AnyFn, OrderWaitOpts } from './types'

type Listener<F extends AnyFn> = (p: Promise<ReturnType<F>>, args: Parameters<F>) => void

export default function createOrder <Orderer extends AnyFn> (orderer: Orderer) {
    const listeners: Array<Listener<Orderer>> = []

    const order = (...args: Parameters<Orderer>) => {
        const promise = Promise.resolve(orderer(...args)) as Promise<ReturnType<Orderer>>
        listeners.forEach(fn => fn(promise, args))
        return promise
    }

    order.useWait = ({ delay= 0, duration= 0, filter= returnTrue }: OrderWaitOpts<Orderer> = {}) => {
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
        }, [filter])

        return isWaiting
    }

    return order
}

function returnTrue () { return true }

function noop () { } // tslint:disable-line: no-empty
