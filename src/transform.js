import {Map as IMap} from 'immutable'
import {concat, resolve as iterable} from 'iterator-util'
import {FallbackMap} from 'fallback-map'

import {Visitor} from './visitor'
import {Path} from './path'
import {isNode, getFullChildren} from './util'

const noop = () => {}

const ENTER = 'enter'
const EXIT = 'exit'

export function Transform (structureMap, subtypeMap) {
  const shapeMap = FallbackMap(() => new Map())
  const stateMap = FallbackMap(() => new Map())

  for (let [type, structure] of structureMap) {
    const shape = shapeMap.get(type)
    for (let child of getFullChildren(structureMap, type)) {
      shape.set(child.name, child)
    }
  }

  function traverseNodeList (nodeList, parentPath, visitorMap) {
    nodeList = nodeList || []
    let result = []

    for (let node of nodeList) {
      if (!isNode(node)) {
        result.push(node)
        continue
      }

      const childResult = traverseNode(node, parentPath, visitorMap)
      if (childResult === void 0) {
        result.push(node)

      } else if (Array.isArray(childResult)) {
        const subResult = traverseNodeList(childResult, parentPath, visitorMap)
        result = result.concat(subResult)

      } else if (childResult !== null) {
        result.push(childResult)
      }
    }

    return result
  }

  function traverseNode (node, parentPath, visitorMap) {
    const {type} = node
    const path = Path(node, parentPath, shapeMap, subtypeMap)
    const handlerList = visitorMap.get(type)

    for (let {enter, key} of handlerList) {
      const result = enter(path, stateMap.get(key))
      if (result === void 0) {
        continue
      }
      return result
    }

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
      if (childResult !== void 0) {
        node[name] = childResult
      }
    }

    for (let {exit, key} of handlerList) {
      const result = exit(path, stateMap.get(key))
      if (result === void 0) {
        continue
      }
      return result
    }
  }

  return function transform (rootNode, rawVisitor) {
    if (!isNode(rootNode)) {
      throw new Error('transform() only takes node object')
    }

    const visitorMap = Visitor(rawVisitor, subtypeMap)

    traverseNode(rootNode, null, visitorMap)
  }
}
