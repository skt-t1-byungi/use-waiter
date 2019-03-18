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

test('wait', async t => {
    const w = createWaiter()
    t.plan(1)
    const p = w.wait('test').then(() => t.pass())
    await delay(50)
    w.trigger('test')
    w.trigger('test')
    await p
})

test('promise', async t => {
    const w = createWaiter()
    const promise = delay(100)

    w.promise('test', promise)
    await delay(90)
    t.true(w.isPending('test'))
    await promise
    t.false(w.isPending('test'))
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
