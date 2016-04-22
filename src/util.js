import {concat, resolve as iterable} from 'iterator-util'
import {FallbackMap} from 'fallback-map'

const primitiveTypes = new Set([
  'null', 'boolean', 'number',
  'string', 'object'
])

export function isNode (node) {
  if (!node || typeof node !== 'object') {
    return false
  }

  const {type} = node
  if (!type || typeof type !== 'string' || primitiveTypes.has(type)) {
    return false
  }

  return true
}

export const isValidType = subtypeMap => (node, type) => {
  if (type === 'null' && node == null) {
    return true
  }

  if (typeof node === type) {
    return true
  }

  if (primitiveTypes.has(type) || !node || typeof node !== 'object') {
    return false
  }

  return subtypeMap.get(type).has(node.type)
}

export function getFullChildren (structureMap, type) {
  const {children, inherits} = structureMap.get(type)

  if (!inherits) {
    return iterable(children)
  }

  return concat(getFullChildren(structureMap, inherits), children)
}

export function ShapeMap (structureMap) {
  const shapeMap = FallbackMap(() => new Map())

  for (let [type, structure] of structureMap) {
    const shape = shapeMap.get(type)
    for (let child of getFullChildren(structureMap, type)) {
      shape.set(child.name, child)
    }
  }

  return shapeMap
}
