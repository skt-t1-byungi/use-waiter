import { useMemo } from 'react'
import Waiter from './Waiter'
import { WaitFn, WaitOpts, Order } from './types'

const waiter = new Waiter()
let uid = 0

export default function useWait (opts: WaitOpts = {}): [boolean, WaitFn] {
    const [id, wait] = useMemo(() => {
        const id = String(uid++)
        const wait = <T>(order: Order<T>) => waiter.wait(id, order)
        return [id, wait]
    }, [])

    const isWaiting = waiter.useWait(id, opts)

    return [isWaiting, wait]
}
