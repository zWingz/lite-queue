import { Queue } from './index'
import * as Faker from 'faker'
function randomDelay(value, isThrow = false) {
  return new Promise((res, rej) => {
    const delay = (Math.random() * 2 + 0.5) * 50
    setTimeout(() => {
      if(isThrow) {
        rej(value)
      } else {
        res(value)
      }
    }, delay)
  })
}

function generateFake(len) {
  const arr = []
  for(let i = 0; i < len; i ++) {
    arr.push(Faker.random.number(100))
  }
  return arr
}

function generatePromiseAll(arr, fnc, format?) {
  const all = []
  const {length: len} = arr
  for(let i = 0; i < len; i ++) {
    let val = arr[i]
    val = format ? format(val, i) : val
    all.push(fnc(val))
  }
  return all
}

function expectError(e: Error, message) {
  expect(e).toBeInstanceOf(Error)
  expect(e.message).toEqual(message + '')
}

describe('test queue', () => {
  it('test return async', (done) => {
    const queue = new Queue()
    const len = 10
    const arr = generateFake(len)
    async function doSome(val) {
      const d = await queue.exec(() => {
        return randomDelay(val)
      })
      expect(d).toEqual(val)
      return d
    }
    const all = generatePromiseAll(arr, doSome)
    Promise.all(all).then((args) => {
      expect(args).toEqual(arr)
      done()
    })
  })
  it('test return sync', (done) => {
    const queue = new Queue()
    const len = 10
    const arr = generateFake(len)
    async function doSome(val) {
      const d = await queue.exec(() => {
        return val * 10
      })
      expect(d).toEqual(val * 10)
      return d
    }
    const all = generatePromiseAll(arr, doSome)
    Promise.all(all).then((args) => {
      expect(args).toEqual(arr.map(each => 10 * each))
      done()
    })
  })
  it('test throw error async', (done) => {
    const queue = new Queue()
    const len = 10
    const arr = generateFake(len)
    async function doSome(val: number, isThrow) {
      return queue.exec(() => {
        if(isThrow) {
          throw new Error(val + '')
        }
        return val
      }).then(d => {
        expect(d).toEqual(val)
        return d
      }).catch(e => {
        expectError(e, val)
        return +e.message
      })
    }
    const all = []
    for(let i = 0; i < len; i ++) {
      all.push(doSome(arr[i], i % 2 === 0))
    }
    Promise.all(all).then((args) => {
      expect(args).toEqual(arr.map(each => each))
      done()
    })
  })
  it('test throw error sync', (done) => {
    const queue = new Queue()
    const len = 10
    const arr = generateFake(len)
    async function doSome(arg: number, isThrow) {
      return queue.exec(() => {
          if(isThrow) {
            throw new Error(arg + '')
          }
          return arg
        }).then(d => {
          expect(d).toEqual(arg)
          return d
        }).catch(e => {
          expect(isThrow).toBeTruthy()
          expectError(e, arg)
          return +e.message
        })
    }
    const all = []
    for(let i = 0; i < len; i ++) {
      all.push(doSome(arr[i], i % 2 === 0))
    }
    Promise.all(all).then((args) => {
      expect(args).toEqual(arr.map(each => each))
      done()
    })
  })
})
