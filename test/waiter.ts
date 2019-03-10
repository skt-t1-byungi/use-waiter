import test from 'ava'
import Waiter from '../src/Waiter'
import { delay } from './_helpers'

test('order by promise', async t => {
    const w = new Waiter()
    const promise = delay(100)

    w.promise('test', promise)
    await delay(90)
    t.true(w.isWaiting('test'))
    await promise
    t.false(w.isWaiting('test'))
})

test('returns the input promise.', t => {
    const w = new Waiter()
    const promise = delay(0)
    t.is(w.promise('test', promise), promise)
})
