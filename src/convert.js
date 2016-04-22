import {resolve as iterable} from 'iterator-util'
import {FallbackMap} from 'fallback-map'

import {Visitor} from './visitor'
import {Path} from './path'
import {isNode, getFullChildren, ShapeMap} from './util'

export function Convert (structureMap, subtypeMap) {
  const stateMap = FallbackMap(() => new Map())
  const shapeMap = ShapeMap(structureMap)

  function traverseNodeList (nodeList, parentPath, visitorMap) {
    let result = []

    for (let node of iterable(nodeList)) {
      if (!isNode(node)) {
        result.push(node)
        continue
      }

      const childResult = traverseNode(node, parentPath, visitorMap)

      if (childResult == null) {
        continue
      }

      if (Array.isArray(childResult)) {
        result = result.concat(childResult)
        continue
      }

      result.push(childResult)
    }

    return result
  }

  function traverseNode (node, parentPath, visitorMap) {
    const {type} = node
    const path = Path(node, parentPath, shapeMap, subtypeMap)

    const childrenScheme = getFullChildren(structureMap, type)

    for (let {name, type: childType, isArray, iterate} of childrenScheme) {
      if (iterate === false) {
        continue
      }

      const child = node[name]

      if (isArray) {
        node[name] = traverseNodeList(child, childType, path, visitorMap)
        continue
      }

      if (!isNode(child)) {
        continue
      }

      const childResult = traverseNode(child, path, visitorMap)

      if (childResult == null) {
        node[name] = null
        continue
      }

      node[name] = childResult
    }

    const [{key, enter: handler}] = visitorMap.get(type)

    if (!handler) {
      const msg = 'visitor for convert() must handle all possible '
                + 'types of source spec'
      throw new Error(msg)
    }

    return handler(path, stateMap.get(key))
  }

  return function createConvert (rawVisitor) {
    const visitorMap = Visitor(rawVisitor, subtypeMap)

    return function convert (rootNode) {
      if (!isNode(rootNode)) {
        throw new Error('convert() only takes node object')
      }

      return traverseNode(rootNode, null, visitorMap)
    }
  }
}
