import test from 'ava'
import { testHook } from 'react-testing-library'
import Waiter from '../src/Waiter'
import './_browser'
import { delay } from './_helpers'

test('change state', async t => {
    const w = new Waiter()

    let isWaiting
    let callsTest = 0
    let callsMock = 0

    testHook(() => {
        isWaiting = w.useWait('test')
        callsTest++
    })
    testHook(() => {
        w.useWait('mock')
        callsMock++
    })

    t.false(isWaiting)
    const promise = delay(100)
    w.order('test', promise)
    await delay(0)
    t.true(isWaiting)
    await promise
    t.false(isWaiting)

    t.is(callsTest, 3)
    t.is(callsMock, 1)
})
