import Waiter from './Waiter'
import { AnyFn } from './types'

const waiter = new Waiter()
let uid = 0

export default function createOrder <Orderer extends AnyFn> (orderer: Orderer) {
    const id = String(uid++)
    const order = (...args: Parameters<Orderer>) => waiter.wait<ReturnType<Orderer>>(id, orderer(...args))
    order.useWait = waiter.useWait

    return order
}
