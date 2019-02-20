import Deferred from 'p-state-defer'
import promiseFinally from './promise-finally'

export interface ReserveOptions {concurrency: number}

export default class Reserver {
    private _reserves: Record<string, [() => any, ReserveOptions]> = Object.create(null)
    private _pending: Record<string, number> = Object.create(null)
    private _queues: Record<string, Array<Deferred<any>>> = Object.create(null)

    public has (name: string) {
        return name in this._reserves
    }

    public reserve (
        name: string,
        runner: () => void,
        { concurrency = Infinity }: Partial<ReserveOptions> = {}
    ) {
        this._reserves[name] = [runner, { concurrency }]
    }

    public order<T> (name: string) {
        const defer = new Deferred<T>()
        const [, opts] = this._reserves[name]
        const count = this._pending[name] || 0

        if (count === opts.concurrency) {
            this._addQueue(name, defer)
        } else {
            this._takeOrder(name, defer)
        }

        return defer.promise
    }

    private _addQueue (name: string, defer: Deferred<any>) {
        if (!(name in this._queues)) this._queues[name] = []
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
        const [runner] = this._reserves[name]

        promiseFinally(Promise.resolve(runner()), () => {
            if (--this._pending[name] === 0) delete this._pending[name]
            this._runNextQueue(name)
        })
        .then(defer.resolve, defer.reject)
    }
}
