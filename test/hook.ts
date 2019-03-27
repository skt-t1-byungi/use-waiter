import { serial as test } from 'ava'
import { renderHook, cleanup } from 'react-hooks-testing-library'
import createWaiter from '../src/'
import delay from '@byungi/p-delay'

import './_browser'

// tslint:disable-next-line:no-console
const consoleError = console.error

test.afterEach(() => {
    cleanup()

    // tslint:disable-next-line:no-console
    console.error = consoleError
})

test('subscribe', async t => {
    const w = createWaiter()

    let calls1 = 0
    let calls2 = 0

    const { result } = renderHook(() => {
        calls1++
        return w.useWait('test')
    })

    renderHook(() => {
        w.useWait('no')
        calls2++
    })

    t.false(result.current)
    const promise = delay(100)
    w.promise('test', promise)
    await delay(0)
    t.true(result.current)
    await promise
    t.false(result.current)

    t.is(calls1, 3)
    t.is(calls2, 1)
})

test('multiple promises', async t => {
    const w = createWaiter()

    let calls = 0
    renderHook(() => {
        w.useWait('test')
        calls++
    })

    w.promise('test', delay(100))
    await delay(50)
    w.promise('test', delay(100))
    await delay(50)
    w.promise('test', delay(100))
    await delay(50)
    w.promise('test', delay(100))
    await delay(50)
    await w.promise('test', delay(100))

    t.is(calls, 3)
})

test('delay', async t => {
    const w = createWaiter()
    const { result } = renderHook(() => w.useWait('test', { delay: 100 }))

    const promise = delay(200)
    w.promise('test', promise)
    await delay(50)
    t.false(result.current)
    await delay(80)
    t.true(result.current)
    await promise
    t.false(result.current)
})

test('not start when promise finishes earlier than the delay.', async t => {
    const w = createWaiter()

    let calls = 0
    renderHook(() => {
        w.useWait('test', { delay: 100 })
        calls++
    })

    await w.promise('test', delay(50))
    t.is(calls, 1)
    await delay(70)
    t.is(calls, 1)
})

test('persist', async t => {
    const w = createWaiter()

    const { result } = renderHook(() => w.useWait('test', { persist: 150 }))

    await w.promise('test', delay(100))
    t.true(result.current)
    await delay(100)
    t.false(result.current)
})

test('complex', async t => {
    const w = createWaiter()
    const { result } = renderHook(() => w.useWait('test', { delay: 100, persist: 150 }))

    const promise = delay(130)
    w.promise('test', promise)
    await delay(90)
    t.false(result.current)
    await delay(20)
    t.true(result.current)
    await promise
    t.true(result.current)
    await delay(100)
    t.true(result.current)
    await delay(50)
    t.false(result.current)
})

test('unmount', async t => {
    // tslint:disable-next-line:no-console
    console.error = t.fail

    const w = createWaiter()
    const { result: r1, unmount: um1 } = renderHook(() => w.useWait('test'))
    const { result: r2, unmount: um2 } = renderHook(() => w.useWait('test', { persist: 150 }))

    w.promise('test', delay(100))
    await delay(50)
    t.true(r1.current)
    t.true(r2.current)
    um1()
    await delay(80)
    um2()
    await delay(50)
    t.true(r1.current)
    t.true(r2.current)
})

test('At the time of initial rendering, persister should work immediately if waiting.', async t => {
    const w = createWaiter()
    w.promise('test', delay(50))
    const { result } = renderHook(() => w.useWait('test', { delay: 30, persist: 100 }))
    t.true(result.current)
    await delay(50)
    t.true(result.current)
})
