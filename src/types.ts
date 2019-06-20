export type AnyFunc = (...args: any) => any
export type FuncOrPromiseLike<R> = (() => R) | PromiseLike<R>
export type EnsurePromiseLike<T> = T extends PromiseLike<infer R> ? PromiseLike<R> : PromiseLike<T>
export interface UseWaitOpts {delay?: number, duration?: number}
