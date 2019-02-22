import test from 'ava'
import { testHook } from 'react-testing-library'
import Waiter from '../src/Waiter'
import './_browser'
import { delay } from './_helpers'

test('subscribe', async t => {
    const w = new Waiter()

    let isWaiting = false
    let calls1 = 0
    let calls2 = 0

    testHook(() => {
        isWaiting = w.useWait('test')
        calls1++
    })
    testHook(() => {
        w.useWait('no')
        calls2++
    })

    t.false(isWaiting)
    const promise = delay(100)
    w.order('test', promise)
    await delay(0)
    t.true(isWaiting)
    await promise
    t.false(isWaiting)

    t.is(calls1, 3)
    t.is(calls2, 1)
})

test('multiple orders', async t => {
    const w = new Waiter()

    let calls = 0
    testHook(() => {
        w.useWait('test')
        calls++
    })

    w.order('test', delay(100))
    await delay(50)
    w.order('test', delay(100))
    await delay(50)
    w.order('test', delay(100))
    await delay(50)
    w.order('test', delay(100))
    await delay(50)
    await w.order('test', delay(100))

    t.is(calls, 3)
})

test('delay', async t => {
    const w = new Waiter()

    let isWaiting = false
    testHook(() => isWaiting = w.useWait('test', { delay: 100 }))

    const promise = delay(200)
    w.order('test', promise)
    await delay(50)
    t.false(isWaiting)
    await delay(80)
    t.true(isWaiting)
    await promise
    t.false(isWaiting)
})

test('not start when order finishes earlier than the delay.', async t => {
    const w = new Waiter()

    let calls = 0
    testHook(() => {
        w.useWait('test', { delay: 100 })
        calls++
    })

    await w.order('test', delay(50))
    t.is(calls, 1)
    await delay(70)
    t.is(calls, 1)
})

test('persist', async t => {
    const w = new Waiter()

    let isWaiting = false
    testHook(() => isWaiting = w.useWait('test', { persist: 150 }))

    await w.order('test', delay(100))
    t.true(isWaiting)
    await delay(100)
    t.false(isWaiting)
})

test('complex', async t => {
    const w = new Waiter()

    let isWaiting = false
    testHook(() => isWaiting = w.useWait('test', { delay: 100, persist: 150 }))

    const promise = delay(130)
    w.order('test', promise)
    await delay(90)
    t.false(isWaiting)
    await delay(20)
    t.true(isWaiting)
    await promise
    t.true(isWaiting)
    await delay(100)
    t.true(isWaiting)
    await delay(50)
    t.false(isWaiting)
})
