export type callback<T = any> = (value: T) => void

export interface Subscription {
  unsubscribe: () => void
}

export class Emitter<T> {
  private subscribers: callback<T>[] = []

  subscribe(cb: callback<T>): Subscription {
    this.subscribers.push(cb)
    return {
      unsubscribe: () => this.subscribers = this.subscribers.filter(v => v !== cb)
    }
  }

  emit(value: T) {
    for (const cb of this.subscribers) {
      cb(value)
    }
  }
}

export const create = <T = any>() => new Emitter<T>()
