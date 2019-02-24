# use-waiter 🤵
A react hook for waiting

## Install
```sh
npm i use-waiter
```

## Example
```js
import createWaiter from 'use-waiter'

const waiter = createWaiter({
    'SEND_MESSAGE': async ({message}) => {
        await sendMessage(message)
    }
})

function App(){
    const { useWait } = waiter
    const isSending = useWait('SEND_MESSAGE', {delay: 300, persist: 600})

    if(isSending){
        return <Loading />
    }

    const onClick = () => {
        waiter.order('SEND_MESSAGE', {message: 'hello'})
    }

    return (
        <>
            <Content />
            <button onClick={onClick}>send!</button>
        </>)
}
```

## API
### createWaiter([reservations])
Create a waiter instance.

#### reservations
Predefine tasks. Can specify options using arrays.
``` js
const reservations = {
    'SEND_MESSAGE': asyncSendMessage,
    'FETCH_DATA': [asyncFetchData, {concurrency: 3}] //👈 concurrency option
}

const waiter = createWaiter(reservations)

waiter.order('FETCH_DATA') // => Perform the defined task.
```

### waiter.reserve(name, worker[, options])
Predefine tasks.

```js
waiter.reserve('SEND_MESSAGE', asyncSendMessage)
waiter.reserve('FETCH_DATA', asyncFetchData, {concurrency: 3})

// or
waiter.reserve({
    'SEND_MESSAGE': asyncSendMessage,
    'FETCH_DATA': [asyncFetchData, {concurrency: 3}]
})
```

#### options
##### `concurrency`
Can optionally limit concurrency.


### waiter.isReserved(name)
Returns whether it is reserved.

```js
waiter.isReserved('SEND_MESSAGE') // => false
waiter.reserve('SEND_MESSAGE', asyncSendMessage)
waiter.isReserved('SEND_MESSAGE') // => true
```

### waiter.order(name[, payload])
Perform the defined task. Returns the promise for the task.

```js
waiter.reserve('SEND_MESSAGE', ({message}) => {
    await asyncSendMessage(message)
    console.log(`Successfully sent the message "${message}".`)
})

await waiter.order('SEND_MESSAGE', {message: 'hello'})
// => Successfully sent the message "hello".
```

### waiter.isWaiting(name)
Returns whether the order is in progress.

```js
waiter.isWaiting('FETCH_DATA') // => false
const promise = waiter.order('FETCH_DATA')
waiter.isWaiting('FETCH_DATA') // => true

promise.then(()=>{
    waiter.isWaiting('FETCH_DATA') // => false
})
```

### waiter.promise(name, promise)
Perform undefined task. Returns the promise for the task.
```js
waiter.promise('DELAY_TIME', delay(1000))

waiter.isReserved('DELAY_TIME') // => false
waiter.isWaiting('DELAY_TIME') // => true
```

### waiter.useWait(name[, options])
A React Hook that subscribes to the status of an order the waiter has received.

```jsx
function App(){
    const { useWait } = waiter
    const isSending = useWait('SEND_MESSAGE', {delay: 300, persist: 600})

    if(isSending){
        return <Loading />
    }

    const onClick = () => {
        waiter.order('SEND_MESSAGE', {message: 'hello'})
    }

    return (
        <>
            <Content />
            <button onClick={onClick}>send!</button>
        </>)
}
```
#### options
##### `delay`
The task responds as late as the delay when it starts.
It will not respond when the task is finished within the delay time.
Prevents flashing that occurs when the task finishes quickly. The default is `0`.

##### `persist`
When the Task ends before the persist time, it responds as late as the remaining persist time. It prevents flashing and ensures minimum loading motion time. The default is `0`.



## License
MIT
