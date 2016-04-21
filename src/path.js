import {isNode} from './util'

export function Path (node, parent, shapeMap, subtypeMap) {
  const {type} = node
  const shape = shapeMap.get(type)

  return {
    node,
    type,
    parent,
    is (alias: string) {
      return subtypeMap.get(alias).has(type)
    },
    get (name: string, index: ?number) {
      const childDesc = shape.get(name)
      if (!childDesc) {
        return null
      }

      const resolvePath = maybeNode => {
        if (isNode(maybeNode)) {
          return Path(maybeNode, this, shapeMap, subtypeMap)
        }
        return maybeNode
      }

      if (childDesc.isArray) {
        if (typeof index === 'number') {
          return resolvePath(node[name][index])
        }
        return node[name].map(resolvePath)
      }

      return resolvePath(node[name])
    }
  }
}
