import React from 'react'
import { getterssetters } from '../../platform/getters-setters'

export function Context(SContext: React.Context<any>, selector?: (v: any) => any) {
  return function(target: any, key: any): any {
    const originalRender = target['render']

    function render(this: any, ...args: any[]) {
      return React.createElement(SContext.Consumer, { children: value => {
        let selected = value
        if (selector) {
          selected = selector(value)
        }
        const $selected = getterssetters.create(selected)
        $selected.subscribe(() => this.forceUpdate())
        this[key] = $selected
        return originalRender.bind(this as any)(...args)
      }})
    }

    target['render'] = render
  }
}