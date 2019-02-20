import { ReserveOptions } from './Reserver'
import Waiter from './Waiter'

interface Reverses {
    [name: string]: [() => any, ReserveOptions] | (() => any)
}

export function createWaiter (reserves: Reverses = {}) {
    const waiter = new Waiter()

    for (const name in reserves) {
        if (!hasOwn(reserves, name)) continue
        const reserve = reserves[name]

        if (typeof reserve === 'function') {
            waiter.reserve(name, reserve)
        } else {
            waiter.reserve(name, ...reserve)
        }
    }

    return waiter
}

export default createWaiter

function hasOwn<T extends object> (obj: T, prop: string) {
    return Object.prototype.hasOwnProperty.call(obj, prop)
}
