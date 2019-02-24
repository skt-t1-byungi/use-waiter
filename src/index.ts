import Waiter, { Reservations } from './Waiter'

export function createWaiter (reservations?: Reservations) {
    const waiter = new Waiter()
    if (reservations) waiter.reserve(reservations)
    return waiter
}

export default createWaiter
