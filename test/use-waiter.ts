import test from 'ava'
import { testHook } from 'react-testing-library'
import Waiter from '../src/Waiter'
import './_browser'
import { delay } from './_helpers'

test('subscribe by name', async t => {
    const w = new Waiter()

    let isWaiting
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
