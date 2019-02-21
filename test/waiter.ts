import test from 'ava'
import Waiter from '../src/Waiter'
import { delay } from './_helpers'

test('reserve', t => {
    const w = new Waiter()
    w.reserve('test', () => 0)
    t.true(w.isReserved('test'))
})

test('reserve by map', t => {
    const w = new Waiter()
    w.reserve({ test1: () => 0 })
    t.true(w.isReserved('test1'))

    w.reserve({ test2: [() => 0], test3: [() => 0, {}] })
    t.true(w.isReserved('test2'))
    t.true(w.isReserved('test3'))
})

test('error if reserve type is invalid', t => {
    const w = new Waiter()
    t.throws(() => w.reserve('test' as any))
    t.throws(() => w.reserve('test' as any, true as any))
    t.throws(() => w.reserve({ test: {} as any }))
    t.throws(() => w.reserve({ test: [1] as any }))
})

test('order by reserve', async t => {
    t.plan(4)

    const w = new Waiter()
    w.reserve('test', () => t.pass())

    t.false(w.isWaiting('test'))
    const promise = w.order('test')
    t.true(w.isWaiting('test'))
    await promise
    t.false(w.isWaiting('test'))
})

test('order by promise', async t => {
    const w = new Waiter()
    const promise = delay(100)

    w.order('test', promise)
    await delay(90)
    t.true(w.isWaiting('test'))
    await promise
    t.false(w.isWaiting('test'))
})
