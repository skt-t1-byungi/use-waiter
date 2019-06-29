import SingleWaiter from './SingleWaiter'
import { useMemo } from 'react'
import { WaitFn, WaitOpts } from './types'

export default function useLocalWait (opts: WaitOpts = {}): [boolean, WaitFn] {
    const waiter = useMemo(() => new SingleWaiter(), [])

    const isWaiting = waiter.useWait(opts)

    return [isWaiting, waiter.wait]
}
