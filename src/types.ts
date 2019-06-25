export type AnyFn = (...args: any) => any
export type Order<T> = (() => T) | Promise<T>
export type WaitFn= <R>(order: Order<R>) => Promise<R>
export interface WaitOpts { delay?: number, duration?: number }
