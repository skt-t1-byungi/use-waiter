import { serial as test } from 'ava'
import { Waiter } from '../src/'
import { renderHook } from '@testing-library/react-hooks'
import delay from '@byungi/p-delay'

test('isWaiting', async t => {
    const w = new Waiter()

    t.false(w.isWaiting('a'))
    t.false(w.isWaiting('b'))
    const p1 = w.wait('a', delay(50))
    const p2 = w.wait('b', delay(80))
    t.true(w.isWaiting('a'))
    t.true(w.isWaiting('b'))
    await p1
    t.false(w.isWaiting('a'))
    t.true(w.isWaiting('b'))
    await p2
    t.false(w.isWaiting('b'))
})

test('clear not used', async t => {
    const w = new Waiter()
    const p = w.wait('a', delay(0))
    t.truthy((w as any)._waiters.a)
    await p
    t.falsy((w as any)._waiters.a)

    const { unmount: um1 } = renderHook(() => w.useWait('a'))
    const { unmount: um2 } = renderHook(() => w.useWait('a'))
    t.truthy((w as any)._waiters.a)
    um1()
    t.truthy((w as any)._waiters.a)
    um2()
    t.falsy((w as any)._waiters.a)
})
