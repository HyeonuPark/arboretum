import {concat} from 'iterator-util'

const primitiveTypes = new Set(['null', 'boolean', 'number', 'string'])

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
    return children
  }

  return concat(getFullChildren(structureMap, inherits), children)
}
