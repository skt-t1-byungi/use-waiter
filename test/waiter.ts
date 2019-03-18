import test from 'ava'
import createWaiter from '../src/'
import delay from '@byungi/p-delay'

test('on, trigger, off', t => {
    t.plan(1)
    const w = createWaiter()
    const off = w.on('test', () => t.pass())
    w.trigger('test')
    off()
    w.trigger('test')
})

test('promise', async t => {
    const w = createWaiter()
    const promise = delay(100)

    w.promise('test', promise)
    await delay(90)
    t.true(w.isWaiting('test'))
    await promise
    t.false(w.isWaiting('test'))
})

test('returns the input promise.', t => {
    const w = createWaiter()
    const promise = delay(0)
    t.is(w.promise('test', promise), promise)
})

test('handled errors should be silent.', async t => {
    const w = createWaiter()
    await t.notThrowsAsync(w.promise('test', Promise.reject('error')).catch(() => undefined))
})
