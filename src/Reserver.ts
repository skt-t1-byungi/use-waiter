import Deferred from 'p-state-defer'
import { hasOwn, promiseFinally } from './util'

export type ReservedWorker = (payload?: object) => any
export interface ReserveOptions {concurrency?: number}

export default class Reserver {
    private _reservations: Record<string, [ReservedWorker, Required<ReserveOptions>]> = {}
    private _pending: Record<string, number> = {}
    private _queues: Record<string, Array<[Deferred<any>, object | undefined]>> = {}

    public has (name: string) {
        return hasOwn(this._reservations, name)
    }

    public reserve (name: string, worker: ReservedWorker, { concurrency = Infinity }: ReserveOptions = {}) {
        this._reservations[name] = [worker, { concurrency }]
    }

    public order<T> (name: string, payload?: object) {
        const defer = new Deferred<T>()
        const [, opts] = this._reservations[name]
        const count = this._pending[name] || 0

        if (count === opts.concurrency) {
            this._addQueue(name, defer, payload)
        } else {
            this._process(name, defer, payload)
        }

        return defer.promise
    }

    private _addQueue (name: string, defer: Deferred<any>, payload?: object) {
        if (!hasOwn(this._queues, name)) this._queues[name] = []
        this._queues[name].push([defer, payload])
    }

    private _processNextQueue (name: string) {
        const queue = this._queues[name]
        if (!queue) return

        const [defer, payload] = queue.shift()!
        if (queue.length === 0) delete this._queues[name]

        this._process(name, defer, payload)
    }

    private _process (name: string, defer: Deferred<any>, payload?: object) {
        this._pending[name] = (this._pending[name] || 0) + 1
        const [runner] = this._reservations[name]

        promiseFinally(Promise.resolve(runner(payload)), () => {
            if (--this._pending[name] === 0) delete this._pending[name]
            this._processNextQueue(name)
        })
        .then(defer.resolve.bind(defer), defer.reject.bind(defer))
    }
}
