
function isPromise(obj) {
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
}

export class Queue<T = any> {
  private _queue: { fnc: Function; res: (value: any) => any; rej: (value: any) => any }[] = []
  private _doing = false
  private _do() {
    this._doing = true
    const item = this._queue.shift()
    if(!item) {
      this._doing = false
      return
    }
    const { fnc, res, rej} = item
    try {
      const result = fnc()
      const is = isPromise(result)
      if (is) {
        (result as Promise<any>).then(
          res, rej
        ).finally(() => this._do())
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
  public exec<E = T>(fnc: Function): Promise<E> {
    return new Promise((res, rej) => {
      this._queue.push({
        fnc,
        res,
        rej
      })
      if (this._doing) {
        return
      }
      this._do()
    })
  }
}
