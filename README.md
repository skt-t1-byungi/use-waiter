# use-waiter 🤵
> A react hook to wait for an order.

[![npm](https://flat.badgen.net/npm/v/use-waiter)](https://www.npmjs.com/package/use-waiter)
[![typescript](https://flat.badgen.net/badge/typescript/3.3.4/blue)](https://www.typescriptlang.org)
[![license](https://flat.badgen.net/github/license/skt-t1-byungi/use-waiter)](https://github.com/skt-t1-byungi/use-waiter/blob/master/LICENSE)

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
    const isSending = useWait('SEND_MESSAGE', {delay: 300, duration: 600})

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

#### Using promise factory
Below is an example of using promise factory function instead of promise.
```js
waiter.promise('TASK', async () => {
    await taskAsync()
})
```
The above code is shown below.
```js
waiter.promise('TASK', (async ()=> {
    await taskAsync()
})())
```

### waiter.isPending(order)
Returns whether the order promise is pending.

```js
waiter.isPending('ORDER') // => false

waiter.promise('ORDER', asyncTask()).then(() => {
    waiter.isPending('ORDER') // => false
})

waiter.isPending('ORDER') // => true
```

### waiter.useWait(order, [options])
A react hook that subscribes to changes in order status.

#### options
##### `delay`
When the promise changes to pending, it responds as late as the delay time. If the promies are completed within the delay time, they will not respond. This prevents flashing that occurs when the pending time is short. The default is `0` milliseconds.

##### `duration`
If the promise ends before the duration time, it responds after the remaining duration time. This ensures loading motion time and prevents flashing. The default is `0` milliseconds.

## License
MIT
