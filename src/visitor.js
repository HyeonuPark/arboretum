import {indexed} from 'iterator-util'
import {FallbackMap} from 'fallback-map'

const noop = () => {}

function normalizeHandler (handler, key) {
  if (typeof handler === 'function') {
    return {
      key,
      enter: handler,
      exit: noop
    }
  }

  if (!handler) {
    throw new Error('empty handler received')
  }

  let {enter, exit} = handler

  if (typeof enter !== 'function') {
    enter = noop
  }

  if (typeof exit !== 'function') {
    exit = noop
  }

  if (enter === noop && exit === noop) {
    throw new Error('empty handler received')
  }

  return {key, enter, exit}
}

export function Visitor (rawVisitor, subtypeMap) {
  const handlerMap = FallbackMap(() => [])

  for (let {index, value: visitor} of indexed(rawVisitor)) {
    for (let [target, rawHandler] of Object.entries(visitor)) {
      const handler = normalizeHandler(rawHandler, index)
      for (let alias of subtypeMap.get(target)) {
        handlerMap.get(alias).push(handler)
      }
    }
  }

  return handlerMap
}
