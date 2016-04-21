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

      const child = childDesc.isArray
        ? node[name][index || 0]
        : node[name]

      return isNode(child)
        ? Path(child, this, shapeMap, subtypeMap)
        : child
    }
  }
}
