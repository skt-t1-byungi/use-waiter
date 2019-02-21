import Deferred from 'p-state-defer'
import { hasOwn, promiseFinally } from './util'

export type ReservedWorker = () => any
export interface ReserveOptions {concurrency?: number}

export default class Reserver {
    private _reserves: Record<string, [ReservedWorker, Required<ReserveOptions>]> = {}
    private _pending: Record<string, number> = {}
    private _queues: Record<string, Array<Deferred<any>>> = {}

    public has (name: string) {
        return hasOwn(this._reserves, name)
    }

    public reserve (name: string, worker: ReservedWorker, { concurrency = Infinity }: ReserveOptions = {}) {
        this._reserves[name] = [worker, { concurrency }]
    }

    public order<T> (name: string) {
        const defer = new Deferred<T>()
        const [, opts] = this._reserves[name]
        const count = this._pending[name] || 0

        if (count === opts.concurrency) {
            this._addQueue(name, defer)
        } else {
            this._process(name, defer)
        }

        return defer.promise
    }

    private _addQueue (name: string, defer: Deferred<any>) {
        if (!hasOwn(this._queues, name)) this._queues[name] = []
        this._queues[name].push(defer)
    }

    private _processNextQueue (name: string) {
        const queue = this._queues[name]
        if (!queue) return

        const defer = queue.shift()!
        if (queue.length === 0) delete this._queues[name]

        this._process(name, defer)
    }

    private _process (name: string, defer: Deferred<any>) {
        this._pending[name] = (this._pending[name] || 0) + 1
        const [runner] = this._reserves[name]

        promiseFinally(Promise.resolve(runner()), () => {
            if (--this._pending[name] === 0) delete this._pending[name]
            this._processNextQueue(name)
        })
        .then(defer.resolve.bind(defer), defer.reject.bind(defer))
    }
}
