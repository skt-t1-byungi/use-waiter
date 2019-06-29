import SingleWaiter from './SingleWaiter'
import { AnyFn, WaitOpts } from './types'

export default function createFixedWait <Orderer extends AnyFn> (orderer: Orderer) {
    const waiter = new SingleWaiter()

    const order = (...args: Parameters<Orderer>) => waiter.wait<ReturnType<Orderer>>(orderer(...args))
    order.useWait = (opts?: WaitOpts) => waiter.useWait(opts)

    return order
}
