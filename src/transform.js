import {concat, resolve as iterable} from 'iterator-util'
import {FallbackMap} from 'fallback-map'

import {Visitor} from './visitor'
import {Path} from './path'
import {isNode, getFullChildren, ShapeMap} from './util'

const noop = () => {}

const ENTER = 'enter'
const EXIT = 'exit'

export function Transform (structureMap, subtypeMap) {
  const shapeMap = ShapeMap(structureMap)
  const stateMap = FallbackMap(() => new Map())

  function traverseNodeList (nodeList, parentPath, visitorMap) {
    let result = []

    for (let node of iterable(nodeList)) {
      if (!isNode(node)) {
        result.push(node)
        continue
      }

      const childResult = traverseNode(node, parentPath, visitorMap)

      if (childResult === void 0) {
        result.push(node)
        continue
      }

      if (Array.isArray(childResult)) {
        const subResult = traverseNodeList(childResult, parentPath, visitorMap)
        result = result.concat(subResult)
        continue
      }

      if (childResult !== null) {
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

      let prevResult, nextResult = child
      while (isNode(nextResult)) {
        prevResult = nextResult
        nextResult = traverseNode(prevResult, path, visitorMap)
      }

      node[name] = nextResult === void 0
        ? prevResult
        : nextResult
    }

    for (let {exit, key} of handlerList) {
      const result = exit(path, stateMap.get(key))
      if (result === void 0) {
        continue
      }
      return result
    }
  }

  return function createTransform (rawVisitor) {
    const visitorMap = Visitor(rawVisitor, subtypeMap)

    return function transform (rootNode) {
      if (!isNode(rootNode)) {
        throw new Error('transform() only takes node object')
      }

      let result, next = traverseNode(rootNode, null, visitorMap)
      while (next != null) {
        result = next
        next = traverseNode(result, null, visitorMap)
      }
      return result || rootNode
    }
  }
}
