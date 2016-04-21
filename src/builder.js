import assert from 'assert'

import {indexed, every, some} from 'iterator-util'

import {isValidType, getFullChildren} from './util'

export function Builder (structureMap, subtypeMap) {
  const builder = {}
  const isValid = isValidType(subtypeMap)

  for (let type of structureMap.keys()) {
    const children = getFullChildren(structureMap, type)

    builder[type] = (...args) => {
      const node = {type}

      for (let {
        index,
        value: {
          type: childType,
          name,
          isArray,
          transformer
        }
      } of indexed(children)) {
        let given = args[index]
        assert.strictEqual(Array.isArray(given), isArray === true)
        assert.ok(every(given, g => some(childType, t => isValid(g, t))))

        if (transformer) {
          given = isArray
            ? given.map(transformer)
            : transformer(given)
        }

        node[name] = given
      }

      return node
    }
  }

  return builder
}
