import assert from 'assert'

import {concat, product, resolve as iterable} from 'iterator-util'
import {Queue} from 'iterable-queue'
import {FallbackMap} from 'fallback-map'

import {Builder} from './builder'
import {Transform} from './transform'

function getSubtypeMap (aliasMap) {
  const subtypeMap = FallbackMap(() => new Set())

  for (let nodeType of aliasMap.keys()) {
    const aliasSet = new Set()

    const queue = Queue(nodeType)
    for (let alias of queue) {
      if (aliasSet.has(alias)) {
        continue
      }
      aliasSet.add(alias)
      subtypeMap.get(alias).add(nodeType)

      for (let aliasOfAlias of aliasMap.get(alias)) {
        queue.add(aliasOfAlias)
      }
    }
  }
  return subtypeMap
}

export function Spec () {
  const typePool = new Set()
  const structureMap = new Map()
  const aliasMap = new Map()

  return {
    define (
      type: string,
      children: ?Array<{
        type: string|Array<string>,
        name: string,
        isArray: ?boolean,
        iterate: ?boolean,
        transform: ?(node: any) => any
      }>,
      {alias, inherits} = {}: ?{
        alias: ?string|Array<string>,
        inherits: ?string
      }
    ) {
      if (typePool.has(type)) {
        throw new Error(`duplicated node type ${type}`)
      }
      if (inherits && !typePool.has(inherits)) {
        throw new Error(`${type} inherits not existing type ${inherits}`)
      }
      typePool.add(type)

      if (children || inherits) {
        structureMap.set(type, {children, inherits})
      }

      aliasMap.set(type, iterable(alias))
    },
    done () {
      const subtypeMap = getSubtypeMap(aliasMap)

      return {
        isAliasOf (maybeAlias, maybeSubtype) {
          return subtypeMap.get(maybeAlias).has(maybeSubtype)
        },
        builder: Builder(structureMap, subtypeMap),
        transform: Transform(structureMap, subtypeMap)
      }
    }
  }
}
