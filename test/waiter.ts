import test from 'ava'
import createWaiter from '../src/'
import delay from '@byungi/p-delay'

test('order', async t => {
    const w = createWaiter()
    const promise = delay(100)

    w.order('test', promise)
    await delay(90)
    t.true(w.isWaiting('test'))
    await promise
    t.false(w.isWaiting('test'))
})

test('returns the input promise.', t => {
    const w = createWaiter()
    const promise = delay(0)
    t.is(w.order('test', promise), promise)
})
