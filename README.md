# use-waiter 🤵
> A react hook to wait for an order.

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

### waiter.promise(order, promise)
Order with promise. Returns the promise passed as an argument.

### waiter.isPending(order)
Returns whether the order promise is pending.

```js
waiter.isPending('ORDER') // => false

waiter.promise('ORDER', asyncTask()).then(() => {
    waiter.isPending('ORDER') // => false
})

waiter.isPending('ORDER') // => true
```

### waiter.on(order, listener)
Subscribe to order status.

```js
waiter.on('DELAY', isDelaying => {
    console.log(`isDelaying: ${isDelaying}`)
})

waiter.promise('DELAY', delay(500))
// => isDelaying: true
// => isDelaying: false (after 500ms.)
```
#### off()
The `on()` returns a function to cancel the subscription.

```js
const off = waiter.on('ORDER', listener)

/* ... */

off()
```

### waiter.wait(order)
Wait until the order status changes or `trigger()`. (Returns promise.)

```js
async function watch(){
    await waiter.wait('DELAY')
    console.log(`first: ${waiter.isPending('DELAY')}`)

    await waiter.wait('DELAY')
    console.log(`second: ${waiter.isPending('DELAY')}`)
}

watch()
waiter.promise('DELAY', delay(500))
// => first: true
// => second: false (after 500ms.)
```

### waiter.trigger(order, [data])
Trigger the subscribed order listeners.

```js
async function watch(){
    const first = await waiter.wait('DELAY')
    console.log(`first: ${first}`)

    const second = await waiter.wait('DELAY')
    console.log(`second: ${second}`)
}

watch()
waiter.trigger('DELAY', 'hello') // => first: 'hello'
waiter.trigger('DELAY', true) // => second: true
```

### waiter.useWait(order, [options])
A react hook that subscribes to changes in order status.

#### options
##### `delay`
When the promise changes to pending, it responds as late as the delay time. If the promies are completed within the delay time, they will not respond. This prevents flashing that occurs when the pending time is short. The default is `0` milliseconds.

##### `persist`
If the promise ends before the persist time, it responds after the remaining persist time. This ensures loading motion time and prevents flashing. The default is `0` milliseconds.

## License
MIT
