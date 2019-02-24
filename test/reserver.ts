import test from 'ava'
import Reserver from '../src/Reserver'
import { range } from './_helpers'

test('has', t => {
    const r = new Reserver()
    t.false(r.has('test'))
    r.reserve('test', () => null)
    t.true(r.has('test'))
})

test('order by reserve', async t => {
    const r = new Reserver()
    r.reserve('test', () => t.pass())
    await r.order('test')
})

test('payload', async t => {
    const r = new Reserver()
    const data: any[] = []
    r.reserve('test', p => data.push(p))
    await Promise.all([r.order('test', { a: 1 }), r.order('test', { b: 2 })])
    t.deepEqual(data, [{ a: 1 }, { b: 2 }])
})

test('concurrency', async t => {
    const mo = async (concurrency: number) => {
        const r = new Reserver()

        let max = 0
        let running = 0

        r.reserve('test', async () => {
            running++
            if (running > max) max = running
            await Promise.resolve()
            running--
        }, { concurrency })

        await Promise.all(range(10).map(() => r.order('test')))

        return [max, running]
    }

    t.deepEqual(await mo(Infinity), [10, 0])
    t.deepEqual(await mo(5), [5, 0])
    t.deepEqual(await mo(3), [3, 0])
    t.deepEqual(await mo(1), [1, 0])
})
