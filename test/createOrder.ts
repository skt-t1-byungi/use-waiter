import { serial as test } from 'ava'
import { renderHook } from '@testing-library/react-hooks'
import { createOrder } from '../src'
import delay from '@byungi/p-delay'

test('share a order state', async t => {
    const order = createOrder(delay)
    const { result: r1 } = renderHook(() => order.useWait())
    const { result: r2 } = renderHook(() => order.useWait())

    t.false(r1.current)
    t.false(r2.current)
    order(50)
    t.true(r1.current)
    t.true(r2.current)
    await delay(50)
    t.false(r1.current)
    t.false(r2.current)
})

test('different options', async t => {
    const order = createOrder(delay)
    const { result: r1 } = renderHook(() => order.useWait({ duration: 80 }))
    const { result: r2 } = renderHook(() => order.useWait({ delay: 30 }))

    order(50)
    t.true(r1.current)
    t.false(r2.current)
    await delay(30)
    t.true(r1.current)
    t.true(r2.current)
    await delay(20)
    t.true(r1.current)
    t.false(r2.current)
    await delay(30)
    t.false(r1.current)
    t.false(r2.current)
})
