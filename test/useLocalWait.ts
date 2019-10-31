import { serial as test } from 'ava'
import { renderHook } from '@testing-library/react-hooks'
import { useLocalWait } from '../src'
import delay from '@byungi/p-delay'

test('change isWaiting', async t => {
    const { result } = renderHook(() => useLocalWait())
    const [isWaiting, wait] = result.current

    t.false(isWaiting)
    const p = wait(delay(0))
    t.true(result.current[0])
    await p
    t.false(result.current[0])
})

test('on overlapped', async t => {
    let calls = 0
    const { result: { current: [, wait] } } = renderHook(() => (calls++, useLocalWait()))

    for (let i = 0; i < 4; i++) {
        wait(delay(100))
        await delay(50)
    }
    t.is(calls, 2)

    await delay(50)
    t.is(calls, 3)
})

test('delay option', async t => {
    const { result } = renderHook(() => useLocalWait({ delay: 100 }))
    const [isWaiting, wait] = result.current

    // short case
    t.false(isWaiting)
    wait(delay(50))
    t.false(result.current[0])
    await delay(50)
    t.false(result.current[0])
    await delay(50)
    t.false(result.current[0])

    // long case
    wait(delay(150))
    t.false(result.current[0])
    await delay(50)
    t.false(result.current[0])
    await delay(50)
    t.true(result.current[0])
})

test('duration option', async t => {
    const { result } = renderHook(() => useLocalWait({ duration: 100 }))
    const [, wait] = result.current

    wait(delay(50))
    t.true(result.current[0])
    await delay(50)
    t.true(result.current[0])
    await delay(40)
    t.true(result.current[0])
    await delay(10)
    t.false(result.current[0])
})

test('complex option', async t => {
    const { result } = renderHook(() => useLocalWait({ delay: 50, duration: 100 }))
    const [, wait] = result.current

    wait(delay(80))
    await delay(50)
    t.true(result.current[0])
    await delay(50)
    t.true(result.current[0])
    await delay(40)
    t.true(result.current[0])
    await delay(10)
    t.false(result.current[0])
})
