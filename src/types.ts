export type AnyFn = (...args: any) => any
export type Order<R> = (() => R) | Promise<R>

export interface WaitOpts {delay?: number, duration?: number}

type filterer<F extends AnyFn> = (...args: Parameters<F>) => boolean
type filter<F extends AnyFn> = filterer<F> | [filterer<F>, any[]]

export interface OrderWaitOpts<F extends AnyFn> extends WaitOpts { filter?: filter<F> }
