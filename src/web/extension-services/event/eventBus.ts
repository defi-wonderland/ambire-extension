type Listener = (params?: any, forceEmit?: boolean) => void

class EventBus {
  events: Record<string, Listener[]> = {}

  emit = (type: string, params?: any, forceEmit?: boolean) => {
    const listeners = this.events[type]
    if (listeners) {
      listeners.forEach((fn) => {
        fn(params, forceEmit)
      })
    }
  }

  once = (type: string, fn: Listener) => {
    const listeners = this.events[type]
    const func = (...params: any[]) => {
      fn(...params)
      this.events[type] = this.events[type].filter((item) => item !== func)
    }
    if (listeners) {
      this.events[type].push(func)
    } else {
      this.events[type] = [func]
    }
  }

  addEventListener = (type: string, fn: Listener) => {
    const listeners = this.events[type]
    if (listeners) {
      this.events[type].push(fn)
    } else {
      this.events[type] = [fn]
    }
  }

  removeEventListener = (type: string, fn: Listener) => {
    const listeners = this.events[type]
    if (listeners) {
      this.events[type] = this.events[type].filter((item) => item !== fn)
    }
  }

  removeAllEventListeners = (type: string) => {
    this.events[type] = []
  }
}

export default new EventBus()
