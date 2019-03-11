# use-waiter 🤵
> A React Hook for waiting

[![npm](https://flat.badgen.net/npm/v/use-waiter)](https://www.npmjs.com/package/use-waiter)

## Install
```sh
npm i use-waiter
```

## Example
```js
import createWaiter from 'use-waiter'

const waiter = createWaiter()

function App(){
    const { useWait } = waiter
    const isSending = useWait('SEND_MESSAGE', {delay: 300, persist: 600})

    if(isSending){
        return <Loading />
    }

    const onClick = () => {
        waiter.promise('SEND_MESSAGE', sendMessageAsync('hello'))
    }

    return (
        <>
            <Content />
            <button onClick={onClick}>send!</button>
        </>)
}
```

## API
### createWaiter()
Create a waiter instance.

### waiter.promise(name, promise)
Add a promise to monitor. Returns the promise received.

### waiter.isWaiting(name)
Returns whether the task is in progress.

```js
waiter.isWaiting('ASYNC_TASK') // => false

waiter.promise('ASYNC_TASK', asyncTask()).then(() => {
    waiter.isWaiting('ASYNC_TASK') // => false
})

waiter.isWaiting('ASYNC_TASK') // => true
```

### waiter.useWait(name[, options])
A react hook that subscribes to the status of the added promise.

#### options
##### `delay`
When the promise changes to pending, it responds as late as the delay time. If the promies are completed within the delay time, they will not respond. This prevents flashing that occurs when the pending time is short. The default is `0`.

##### `persist`
If the promise ends before the persist time, it responds after the remaining persist time. This ensures loading motion time and prevents flashing. The default is `0`.

## License
MIT
