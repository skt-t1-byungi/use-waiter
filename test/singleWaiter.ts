import { serial as test } from 'ava'
import SingleWaiter from '../src/SingleWaiter'
import delay from '@byungi/p-delay'

test('isWaiting', async t => {
    const w = new SingleWaiter()

    // one
    t.false(w.isWaiting)
    const p1 = w.wait(delay(0))
    t.true(w.isWaiting)
    await p1
    t.false(w.isWaiting)

    // overlapped
    const p2 = w.wait(delay(50))
    await delay(30)
    t.true(w.isWaiting)
    const p3 = w.wait(delay(50))
    await p2
    t.true(w.isWaiting)
    await p3
    t.false(w.isWaiting)
})

test('function type order', async t => {
    const w = new SingleWaiter()
    const p = w.wait(() => delay(50))
    t.true(w.isWaiting)
    await p
    t.false(w.isWaiting)
})

test('handled errors should be silent.', async t => {
    const w = new SingleWaiter()
    await t.notThrowsAsync(w.wait(Promise.reject('error')).catch(() => undefined))
})
