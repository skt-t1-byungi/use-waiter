import Deferred from 'p-state-defer'
import { hasOwn, pFinally } from './util'

export interface ReserveOptions { concurrency: number}

export default class Reserver {
    private _sheets: Record<string, [() => void, ReserveOptions]> = {}
    private _pending: Record<string, number> = {}
    private _queues: Record<string, Array<Deferred<any>>> = {}

    public has (name: string) {
        return hasOwn(this._sheets, name)
    }

    public reserve (
        name: string,
        runner: () => void,
        { concurrency = Infinity }: Partial<ReserveOptions> = {}
    ) {
        this._sheets[name] = [runner, { concurrency }]
    }

    public order<T = void> (name: string) {
        const defer = new Deferred<T>()
        const [, opts] = this._sheets[name]
        const count = this._pending[name] || 0

        if (count === opts.concurrency) {
            this._addQueue(name, defer)
        } else {
            this._takeOrder(name, defer)
        }

        return defer.promise
    }

    private _addQueue (name: string, defer: Deferred<any>) {
        if (!hasOwn(this._queues, name)) this._queues[name] = []
        this._queues[name].push(defer)
    }

    private _runNextQueue (name: string) {
        const queue = this._queues[name]
        if (!queue) return

        const defer = queue.shift()!
        if (queue.length === 0) delete this._queues[name]

        this._takeOrder(name, defer)
    }

    private _takeOrder (name: string, defer: Deferred<any>) {
        this._pending[name] = (this._pending[name] || 0) + 1
        const [work] = this._sheets[name]

        pFinally(Promise.resolve(work()), () => {
            if (--this._pending[name] === 0) delete this._pending[name]
            this._runNextQueue(name)
        })
        .then(defer.resolve, defer.reject)
    }
}
