import { useMemo } from 'react'
import Waiter from './Waiter'
import { WaitFn, WaitOpts } from './types'

export default function useWait (opts: WaitOpts = {}): [boolean, WaitFn] {
    const waiter = useMemo(() => new Waiter(), [])

    const isWaiting = waiter.useWait(opts)

    return [isWaiting, waiter.wait]
}
