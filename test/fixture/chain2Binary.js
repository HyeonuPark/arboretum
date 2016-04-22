import {expect} from 'chai'
import arboretum from '../../src/index'

describe('#fixture# Chain to binary expression', () => {
  const {define, done} = arboretum()

  define('Node')

  define('Chain', [
    {
      name: 'body',
      type: 'string',
      isArray: true
    }
  ], {alias: 'Node'})

  define('Binary', [
    {
      name: 'left',
      type: ['string', 'Node']
    },
    {
      name: 'right',
      type: ['string', 'Node']
    }
  ], {alias: 'Node'})

  const {builder: t, transform} = done()

  const visitor = {
    Chain (path) {
      const {body} = path.node
      if (body.length === 2) {
        return t.Binary(body[0], body[1])
      }
      return t.Binary(
        body[0],
        t.Chain(body.slice(1))
      )
    }
  }

  const transformTree = transform(visitor)

  it('should return nested binaries', () => {
    const chain5 = t.Chain(['a', 'b', 'c', 'd', 'e'])
    expect(transformTree(chain5)).to.deep.equal({
      type: 'Binary',
      left: 'a',
      right: {
        type: 'Binary',
        left: 'b',
        right: {
          type: 'Binary',
          left: 'c',
          right: {
            type: 'Binary',
            left: 'd',
            right: 'e'
          }
        }
      }
    })
  })

  it('should return two branches of nested binaries', () => {
    const twoChain = t.Binary(t.Chain(['a', 'b']), t.Chain(['c', 'd', 'e']))
    expect(transformTree(twoChain)).to.deep.equal({
      type: 'Binary',
      left: {
        type: 'Binary',
        left: 'a',
        right: 'b'
      },
      right: {
        type: 'Binary',
        left: 'c',
        right: {
          type: 'Binary',
          left: 'd',
          right: 'e'
        }
      }
    })
  })
})
