import { emitter } from '../emitter'
import { checktype } from '../check-type'

const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]

export type ProxySubscriber<T = any> = (
  T & emitter.Emitter<void>
)

export function create<T = any>(source: T): ProxySubscriber<T> {
  const update$ = emitter.create<void>()
  const proxy = observe(source, update$)
  proxy.subscribe = update$.subscribe.bind(update$)
  return proxy
}

export function observe(
  source: any, 
  update$: emitter.Emitter<void>
): any {
  if (checktype.isArray(source)) {
    return observeArray(source, update$)
  }
  if (checktype.isObject(source)) {
    return observeObject(source, update$)
  }
}

export const observeObject = (source: Array<any>, update$: emitter.Emitter<void>) => {
  const proxy: any = {}
  for (const key in source) {
    if (checktype.isArray(source[key])) {
      proxy[key] = observeArray(source[key], update$)
      continue
    }
    if (checktype.isObject(source[key])) {
      proxy[key] = observeObject(source[key], update$)
      continue
    }
    Object.defineProperty(proxy, key, {
      enumerable: true,
      get: () => {
        return source[key]
      },
      set: (value) => {
        if (source[key] === value) {
          return true
        }
        source[key] = value
        update$.emit()
      }
    })
  } 
  return proxy
}

export const observeArray = (source: any, update$: emitter.Emitter<void>) => {
  const proxy: any = [...source]
  for (let i = 0; i < proxy.length; i++) {
    if (checktype.isArray(proxy[i])) {
      proxy[i] = observeArray(proxy[i], update$)
      continue
    }
    if (checktype.isObject(proxy[i])) {
      proxy[i] = observeObject(proxy[i], update$)
      continue
    }
  }
  for (const method of methodsToPatch) {
    patchMethod(proxy, method, (...args) => {
      source[method](...args)
      update$.emit()
    })
  }
  return proxy
}

export const patchMethod = (target: any, methodKey: string, patch: (...args: any[]) => void) => {
  const original = target[methodKey]
  target['$' + methodKey] = target[methodKey]
  
  target[methodKey] = function () {
    original.apply(target, arguments)
    patch(...arguments)
  }
}
