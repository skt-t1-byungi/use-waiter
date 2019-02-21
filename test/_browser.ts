import jsdom from 'jsdom'

const dom = new jsdom.JSDOM('<!doctype html><html><body></body></html>')
Object.assign(global, {
    window: dom.window,
    document: dom.window.document,
    navigator: dom.window.navigator,
    Node: dom.window.Node
})

import 'mutationobserver-shim'
(global as any).MutationObserver = (dom.window as any).MutationObserver
