import React, { useCallback } from 'react'
import ReactDOM from 'react-dom'
import createStore from 'use-simple-store'
import DUMMY_TEXTS from './dummy_texts.json'
import { createFixedWait, useWaitBuffer } from '../src'
import delay from '@byungi/p-delay'
import cx from 'clsx'

const waitDelay = createFixedWait(delay)

const WAITER_OPTS = [
    { delay: 0, duration: 0 },
    { delay: 300, duration: 0 },
    { delay: 300, duration: 900 }
]

const store = createStore({ textIdx: 0, selectedOptIdx: 0 })

const App = () => {
    return (
        <div className='app'>
            <Example className='app__sec' />
            <main className='app__sec main'>
                <div className='main__inner'>
                    <header className='head main__head'>
                        <div className='head__logo'>🤵</div>
                        <h1 className='head__title'>use-waiter</h1>
                        <p className='head__desc'>A react hook to wait for an asynchronous order.</p>
                    </header>
                    <Options className='main__opts' />
                    <section className='btns main__btns'>
                        {[50, 400, 800].map(t => {
                            const onBtnClick = async () => {
                                await waitDelay(t)
                                store.update(s => {
                                    s.textIdx = (s.textIdx + 1) % DUMMY_TEXTS.length
                                })
                            }
                            return <button className='btns__btn' key={t} onClick={onBtnClick}>delay({t})</button>
                        })}
                    </section>
                    <footer className='foot main__foot'>
                        <a className='foot__link' href='https://github.com/skt-t1-byungi/use-waiter'>github</a> / MIT
                    </footer>
                </div>
            </main>
        </div>)
}

const Example = ({ className }: {className?: string}) => {
    const { textIdx, selectedOptIdx } = store.useStore()
    const isNoneOpt = selectedOptIdx === -1
    const isWaiting = waitDelay.useWait(WAITER_OPTS[selectedOptIdx]) && !isNoneOpt
    const showIdx = useWaitBuffer(isWaiting, textIdx)

    return (
        <div className={cx(className, 'exam')}>
            <div className={cx('exam__inner', { 'exam__inner--loading': isWaiting })}>
                {DUMMY_TEXTS[showIdx]}
                {isWaiting && <Spinner className='exam__spinner' />}
            </div>
        </div>)
}

const Spinner = ({ className }: {className?: string}) => {
    return (
        <div className={cx(className, 'spinner')}>
            <div className='spinner__i spinner__i--1' />
            <div className='spinner__i spinner__i--2' />
            <div className='spinner__i spinner__i--3' />
            <div className='spinner__i spinner__i--4' />
        </div>)
}

const Options = ({ className }: {className?: string}) => {
    const selectedIdx = store.useStore(s => s.selectedOptIdx)
    return (
        <section className={cx(className, 'opts')}>
            <label className='opts__opt'>
                <input
                    name='opts'
                    type='radio'
                    className='opts__radio'
                    onChange={() => store.update(s => { s.selectedOptIdx = -1 })}
                    checked={selectedIdx === -1}
                />
                NO LOADER
            </label>
            {WAITER_OPTS.map((opt, idx) => (
                <label className='opts__opt' key={idx}>
                    <input
                        name='opts'
                        type='radio'
                        className='opts__radio'
                        onChange={() => store.update(s => { s.selectedOptIdx = idx })}
                        checked={idx === selectedIdx}
                    />
                    {`useWait('DELAY', {delay: ${opt.delay}, duration: ${opt.duration}})`}
                </label>)
            )}
        </section>)
}

ReactDOM.render(<App />, document.getElementById('app'))
