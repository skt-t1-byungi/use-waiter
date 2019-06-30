// tslint:disable: max-line-length
import React, { useCallback, useRef, useEffect } from 'react'
import ReactDOM from 'react-dom'
import createStore from 'use-simple-store'
import DUMMY_TEXTS from './dummy_texts.json'
import { createFixedWait, useWaitBuffer } from '../src'
import delay from '@byungi/p-delay'
import cx from 'clsx'

const waitDelay = createFixedWait(delay)

const WAITER_OPTS = [
    { delay: 0, duration : 0 },
    { delay: 300, duration : 0 },
    { delay: 300, duration : 900 }
]

const store = createStore({ textIdx: 0, selectedOptIdx: 0 })

const App = () => {
    return (
    <div className='app'>
        <Example className='app__exam' />
        <main className='app__main main'>
            <div className='main__inner'>
                <header className='head'>
                    <div className='head__logo'>🤵</div>
                    <h1 className='head__title'>use-waiter</h1>
                    <p className='head__desc'>A react hook to wait for an asynchronous order.</p>
                </header>
                <Options />
                <section className='btns'>
                    {[50, 350].map(t => {
                        const onBtnClick = async () => {
                            await waitDelay(t)
                            store.update(s => {
                                s.textIdx = (s.textIdx + 1) % DUMMY_TEXTS.length
                            })
                        }
                        return <button className='btns__btn' key={t} onClick={onBtnClick}>delay({t})</button>
                    })}
                </section>
                <footer className='foot'>
                    <a className='foot__link' href='https://github.com/skt-t1-byungi/use-waiter'>github</a> / MIT
                </footer>
            </div>
        </main>
   </div>)
}

const Example = React.memo(({ className }: {className?: string}) => {
    const { textIdx: _textIdx, selectedOptIdx } = store.useStore()
    const isWaiting = waitDelay.useWait(WAITER_OPTS[selectedOptIdx])
    const textIdx = useWaitBuffer(isWaiting, _textIdx)

    return (
        <div className={cx(className, 'exam')}>
            {isWaiting && <Spinner className='exam__spinner' />}
            <div className={cx('exam__inner', { 'exam__inner--loading': isWaiting })}>
                {DUMMY_TEXTS[textIdx]}
            </div>
        </div>)
})

const Spinner = React.memo(({ className }: {className?: string}) => {
    return (
        <div className={cx(className, 'spinner')}>
            <div className='spinner__i spinner__i--1'></div>
            <div className='spinner__i spinner__i--2'></div>
            <div className='spinner__i spinner__i--3'></div>
            <div className='spinner__i spinner__i--4'></div>
        </div>)
})

const Options = React.memo(() => {
    const selectedIdx = store.useStore(s => s.selectedOptIdx)

    return (
        <section className='opts'>
            {WAITER_OPTS.map((opt, idx) => {
                const onOptChange = useCallback(() => {
                    store.update(s => { s.selectedOptIdx = idx })
                }, [])

                return (
                    <label className='opts__opt' key={idx}>
                        <input
                            name='opts'
                            type='radio'
                            className='opts__radio'
                            onChange={onOptChange}
                            checked={idx === selectedIdx}
                        />
                        {`useWait('DELAY', {delay: ${opt.delay}, duration: ${opt.duration}})`}
                    </label>)
            })}
        </section>)
})

ReactDOM.render(<App />, document.getElementById('app'))
