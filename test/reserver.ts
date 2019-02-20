import test from 'ava'
import Reserver from '../src/Reserver'

test('has', t => {
    const r = new Reserver()
    t.false(r.has('test'))
    r.reserve('test', () => null)
    t.true(r.has('test'))
})

test('order with reservation', async t => {
    const r = new Reserver()
    r.reserve('test', () => t.pass())
    await r.order('test')
})
