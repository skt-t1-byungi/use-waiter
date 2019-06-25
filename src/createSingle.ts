import createWaiter from './createWaiter'
import { AnyFn, WaitOpts } from './types'

const waiter = createWaiter()
let uid = 0

export default function createSingle <Orderer extends AnyFn> (orderer: Orderer) {
    const id = uid++

    const order = (...args: Parameters<Orderer>) => waiter.wait<ReturnType<Orderer>>(id, orderer(...args))
    order.useWait = (opts?: WaitOpts) => waiter.useWait(id, opts)

    return order
}
