import { getterssetters } from '../../platform/getters-setters'

const ignored = ['state', '_reactInternalFiber', '_reactInternalInstance', "props", "context", "refs", "updater", "isReactComponent", 'setState', 'forceUpdate']

export function ViewController() {
  return function(constructor: any): any {
    return class extends constructor {
      constructor(...args: any[]) {
        super(...args)

        const cache: { [key: string]: any } = {}
        for (const key of Object.keys(this).filter(v => !ignored.includes(v))) {
          cache[key] = this[key]
        }

        const $component = getterssetters.create(cache)
        $component._onchange(() => this.forceUpdate())

        for (const key of Object.keys(cache)) {
          Object.defineProperty(this, key, {
            enumerable: true,
            get: () => {
              return $component[key]
            },
            set: (value: any) => {
              if (cache[key] === value) {
                return true
              }
              ;($component as any)[key] = value
            }
          })
        }
      }
    }
  }
}