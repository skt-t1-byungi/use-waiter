import Waiter from './Waiter'
import { AnyFn } from './types'

export default function createOrder <Orderer extends AnyFn> (orderer: Orderer) {
    const waiter = new Waiter()

    const order = (...args: Parameters<Orderer>) => waiter.wait<ReturnType<Orderer>>(orderer(...args))
    order.useWait = waiter.useWait

    return order
}
