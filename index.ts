function isPromise(obj) {
  return (
    !!obj &&
    (typeof obj === 'object' || typeof obj === 'function') &&
    typeof obj.then === 'function'
  )
}

type ExecOptions = {
  useDone?: boolean
}

class Queue<T = any> {
  private _queue: ({
    fnc: Function
    res: (value: any) => any
    rej: (value: any) => any
  })[] = []
  private _doing = false
  private _done = []
  private _do() {
    this._doing = true
    const item = this._queue.shift()
    if (!item) {
      this._doing = false
      return
    }
    const { fnc, res, rej } = item
    try {
      const result = fnc()
      const is = isPromise(result)
      if(is) {
        (result as Promise<any>).then(res, rej).finally(() => this._do())
      } else {
        res(result)
        this._do()
      }
    } catch(e) {
      rej(e)
      this._do()
    }
  }
  constructor() {
    this._do = this._do.bind(this)
  }
  public exec<E = T>(fnc: Function, options: ExecOptions = {}): Promise<E> {
    const ret = new Promise<E>((res, rej) => {
      this._queue.push({
        fnc,
        res,
        rej,
        ...options
      })
      if (this._doing) {
        return
      }
      this._do()
    })
    options.useDone && this._done.push(ret)
    return ret
  }
  public done<E = T>(): Promise<E[]> {
    const ret = Promise.all([].concat(this._done))
    this.clearDone()
    return ret
  }
  public clearDone() {
    this._done = []
  }
}

export { Queue }
export default Queue
