## lite-queue

[![CircleCI](https://circleci.com/gh/zWingz/lite-queue.svg?style=svg)](https://circleci.com/gh/zWingz/lite-queue)
[![codecov](https://codecov.io/gh/zWingz/lite-queue/branch/master/graph/badge.svg)](https://codecov.io/gh/zWingz/lite-queue)

call `function` in queue

### Usage

```javascript
import Queue from 'lite-queue'
const q = new Queue()

// sync function
q.exec(() => {
  return 1
}).then(d => {
  console.log(d === 1) // true
})

// async
q.exec(() => {
  return new Promise(res => {
    res(2)
  })
}).then(d => {
  console.log(d === 2) // true
})
```

###
