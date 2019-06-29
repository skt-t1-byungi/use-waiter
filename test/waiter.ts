import { serial as test } from 'ava'
import { Waiter } from '../src/'
import delay from '@byungi/p-delay'

test('wait', async t => {
    const w = new Waiter()
    const p = delay(50)

    w.wait('test', p)
    await delay(40)
    t.true(w.isWaiting('test'))
    await p
    t.false(w.isWaiting('test'))
})

test('function type order', async t => {
    const w = new Waiter()
    const p = w.wait('test', () => delay(50))

    await delay(40)
    t.true(w.isWaiting('test'))
    await p
    t.false(w.isWaiting('test'))
})

test('handled errors should be silent.', async t => {
    const w = new Waiter()
    await t.notThrowsAsync(w.wait('test', Promise.reject('error')).catch(() => undefined))
})
