import Waiter, { ReserveMap } from './Waiter'

export function createWaiter (reserves?: ReserveMap) {
    const waiter = new Waiter()
    if (reserves) waiter.reserve(reserves)
    return waiter
}

export default createWaiter
