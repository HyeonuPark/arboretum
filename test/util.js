import {expect} from 'chai'
import {FallbackMap} from 'fallback-map'
import {isNode, isValidType} from '../src/util'

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
      expect(isNode({type: 'object'})).to.be.false
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

  describe('.isValidType()', () => {
    const subtypeMap = FallbackMap(() => new Set())
    subtypeMap.get('foo').add('bar').add('baz')

    it('should be a curried function', () => {
      const isValid = isValidType(subtypeMap)

      expect(isValid).to.be.a('function')
    })

    it('should treat string as \'string\' type', () => {
      const isValid = isValidType(subtypeMap)

      expect(isValid('text', 'string')).to.be.true
      expect(isValid({type: 'string'}, 'string')).to.be.false
    })

    it('should treat nullish value as \'null\' type', () => {
      const isValid = isValidType(subtypeMap)

      expect(isValid(42, 'number')).to.be.true
      expect(isValid({type: 'number'})).to.be.false
    })

    it('should be possible to track subtypes', () => {
      const isValid = isValidType(subtypeMap)

      expect(isValid({type: 'bar'}, 'foo')).to.be.true
      expect(isValid({type: 'foo'}, 'baz')).to.be.false
    })
  })

  describe('.getFullChildren()', () => {
    
  })
})
