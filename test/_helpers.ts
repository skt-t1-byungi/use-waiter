export const range = (n: number) => [...Array(10).keys()]

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
