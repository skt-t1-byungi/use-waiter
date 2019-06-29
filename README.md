# use-waiter 🤵
> A react hook to wait for an asynchronous order.

[![npm](https://flat.badgen.net/npm/v/use-waiter)](https://www.npmjs.com/package/use-waiter)
[![license](https://flat.badgen.net/github/license/skt-t1-byungi/use-waiter)](https://github.com/skt-t1-byungi/use-waiter/blob/master/LICENSE)

## Install
```sh
npm i use-waiter
```

## Example
```jsx
import {useWait, wait} from 'use-waiter'

function App(){
    const isSending = useWait('SEND_MESSAGE', {delay: 300, duration: 600})

    if(isSending){
        return <Loading />
    }

    const onClick = () => {
        wait('SEND_MESSAGE', sendMessageAsync('hello'))
    }

    return (
        <>
            <Content />
            <button onClick={onClick}>send!</button>
        </>)
}
```

## API
### wait(name, order)
Wait for an order. Orders should be promise or function. Returns the order promise.

```js
// promise order
const promise = sendMessageAsync('hello')
wait('SEND_MESSAGE', promise)

// function order
wait('SEND_MESSAGE', async () => {
    await sendMessageAsync('hello')
})
```

### isWaiting(name)
Returns whether order is waiting or not.
```js
import {isWaiting, wait} from 'use-waiter'

isWaiting('TASK') // => false

wait('TASK', asyncTask()).then(() => {
    isWaiting('TASK') // => false
})

isWaiting('TASK') // => true
```

### useWait(name[, opts])
A react hook that subscribes to changes in order status.

#### options
##### `delay`
When promise changes to pending, respond as late as the delay time. if promise is completed within the delay time, it does not respond. This prevents flashing when the pending time is short.The default value is `0`ms.

##### `duration`
When the promise is completed before the duration time, respond after the remaining duration time. This will ensure minimum motion time to prevent flashing. The default value is `0`ms.

### new Waiter()
Create an independent waiter instance.
```js
import {Waiter, isWaiting} from 'use-waiter'

const waiter = new Waiter()
waiter.wait('TASK', asyncTask())

waiter.isWaiting('TASK') // => true
isWaiting('TASK') // => false
```

### useLocalWait([opts])
A react hook for local use within a component.

```jsx
import {useLocalWait} from 'use-waiter'

function App(){
    const [isSending, wait] = useLocalWait({delay: 300, duration: 600})

    if(isSending){
        return <Loading />
    }

    const onClick = () => {
        wait(sendMessageAsync('hello'))
    }

    return (
        <>
            <Content />
            <button onClick={onClick}>send!</button>
        </>)
}
```

#### options
Same as [`useWait` options](#options).

### createFixedWait(orderer)
Create a waiter that performs a fixed single order.

```jsx
import {createFixedWait} from 'use-waiter'

const sendMessage = createFixedWait(async (text) => {
    await sendMessageAsync(text)
})

function App(){
    const isSending = sendMessage.useWait({delay: 300, duration: 600})

    if(isSending){
        return <Loading />
    }

    const onClick = () => {
        sendMessage('hello')
    }

    return (
        <>
            <Content />
            <button onClick={onClick}>send!</button>
        </>)
}
```

## License
MIT
