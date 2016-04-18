import assert from 'assert'

import {indexed, every, some} from 'iterator-util'

const valueTypes = new Set(['null', 'boolean', 'number', 'string'])

function isValidType (given, type) {
  if (type === 'null' && given == null) {
    return true
  }
  if (typeof given === type) {
    return true
  }
  if (valueTypes.has(type) || !given || typeof given !== 'object') {
    return false
  }
  return given.type === type
}

function getFullChildren (structureMap, type) {
  const {children, inherits} = structureMap.get(type)

  if (!inherits) {
    return children
  }

  return getFullChildren(structureMap, inherits).concat(children)
}

export function Builder (structureMap) {
  const builder = {}

  for (let type of structureMap.keys()) {
    const children = getFullChildren(structureMap, type)

    builder[type] = (...args) => {
      const node = {}

      for (let {
        index,
        value: {
          type: childType,
          name,
          isArray,
          transform
        }
      } of indexed(children)) {
        const given = args[index]
        assert.stritEqual(Array.isArray(given), isArray === true)
        assert.ok(every(given, g => some(childType, t => isValidType(g, t))))

        node[name] = given
      }

      return node
    }
  }

  return builder
}
