import { useRef, useState, useLayoutEffect, useMemo } from 'react'
import createDuration from 'rsup-duration'

type Order<R> = (() => R) | Promise<R>
type WaitFn= <R>(order: Order<R>) => Promise<R>

// tslint:disable-next-line: cognitive-complexity
export default function useWait ({ delay = 0, duration = 0 } = {}): [boolean, WaitFn] {
    const [isWaiting, setWaiting] = useState(false)
    const effectorRef = useRef <null | ((b: boolean) => void)>(null)

    const wait = useMemo(() => {
        let count = 0

        function emit (isWaiting: boolean) {
            ((effectorRef && effectorRef.current) || setWaiting)(isWaiting)
        }

        return (order: Order<any>) => {
            if (++count === 1) emit(true)

            if (typeof order === 'function') order = order()

            const onFinally = () => {
                if (--count === 0) emit(false)
            }

            return Promise.resolve(order).then(
                v => (onFinally(), v),
                err => (onFinally(), Promise.reject(err))
            )
        }
    }, [])

    useLayoutEffect(() => {
        const delayer = delay > 0 ? createDuration(delay) : null
        const persister = duration > 0 ? createDuration(duration) : null

        let next: boolean | null = null
        let unmounted = false

        const effector = effectorRef.current = (isWaiting: boolean) => {
            if ((delayer && delayer.isDuring) || (persister && persister.isDuring)) {
                next = isWaiting
                return
            }

            if (isWaiting) {
                if (delayer) {
                    next = true
                    delayer.start().then(afterDelay) // tslint:disable-line: no-floating-promises
                } else {
                    startWaiting()
                }
            } else {
                setWaiting(false)
            }
        }

        if (isWaiting) effector(true)

        return () => {
            unmounted = true
            if (effectorRef.current === effector) effectorRef.current = null
        }

        function startWaiting () {
            setWaiting(true)
            if (persister) persister.start().then(afterDuration) // tslint:disable-line: no-floating-promises
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

    return [isWaiting, wait]
}
