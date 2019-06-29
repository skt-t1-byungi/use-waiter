import Waiter from './Waiter'
import { AnyFn, WaitOpts } from './types'

const waiter = new Waiter()
let uid = 0

export default function createFixedWait <Orderer extends AnyFn> (orderer: Orderer) {
    const id = uid++

    const order = (...args: Parameters<Orderer>) => waiter.wait<ReturnType<Orderer>>(id, orderer(...args))
    order.useWait = (opts?: WaitOpts) => waiter.useWait(id, opts)

    return order
}
