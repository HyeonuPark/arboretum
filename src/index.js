import assert from 'assert'

import {concat, product, resolve as iterable} from 'iterator-util'
import {Queue} from 'iterable-queue'

import {Builder} from './builder'
import {Search, Transform} from './visit'

function flattenAlias (aliasMap) {
  const aliasFlatten = new Map()
  for (let [nodeType, directAlias] of aliasMap.entries()) {
    const aliasSet = new Set()
    aliasFlatten.set(nodeType, aliasSet)

    const queue = Queue(directAlias)
    for (let alias of queue) {
      if (aliasSet.has(alias)) {
        continue
      }
      aliasSet.add(alias)

      for (let aliasOfAlias of aliasMap.get(alias)) {
        queue.add(aliasOfAlias)
      }
    }
  }
  return aliasFlatten
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
        transform: ?(node: any) => any
      }>,
      alias: ?string|Array<string>,
      inherits: ?string
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
      const aliasFlatten = flattenAlias(aliasMap)

      return {
        isAliasOf (maybeAlias, maybeSubtype) {
          return aliasFlatten.get(maybeSubtype).has(maybeAlias)
        },
        builder: Builder(structureMap),
        search: Search(structureMap),
        transform: Transform(structureMap)
      }
    }
  }
}
