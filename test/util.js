import {expect} from 'chai'
import {isNode} from '../src/util'

describe('util', () => {
  describe('.isNode()', () => {
    it('should return false for primitive values', () => {
      expect(isNode(true)).to.be.false
      expect(isNode(false)).to.be.false
      expect(isNode(42)).to.be.false
      expect(isNode('foo')).to.be.false
      expect(isNode(null)).to.be.false
    })

    it('should return false for object with reserved type name', () => {
      expect(isNode({type: 'null'})).to.be.false
      expect(isNode({type: 'boolean'})).to.be.false
      expect(isNode({type: 'number'})).to.be.false
      expect(isNode({type: 'string'})).to.be.false
    })

    it('should return true for valid node object', () => {
      expect(isNode({type: 'MyType'})).to.be.true
      expect(isNode({type: 'anotherType'})).to.be.true
      expect(isNode({
        type: 'answer',
        value: 42
      })).to.be.true
    })
  })
})
