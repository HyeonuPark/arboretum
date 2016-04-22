import {expect} from 'chai'
import arboretum from '../../src/index'

function spec1 () {
  const {define, done} = arboretum()

  define('Binary', [
    {
      name: 'left',
      type: ['string', 'Binary']
    },
    {
      name: 'right',
      type: ['string', 'Binary']
    },
    {
      name: 'relation',
      type: 'string',
      iterable: false
    }
  ])

  return done()
}

function spec2 () {
  const {define, done} = arboretum()

  define('Binary', [
    {
      name: 'left',
      type: ['string', 'Binary']
    },
    {
      name: 'right',
      type: ['string', 'Binary']
    }
  ])

  return done()
}

describe('#fixture# Convert tree between 2 specs', () => {
  const {builder: t1} = spec1()
  const tree = t1.Binary(
    t1.Binary('a', 'b', 'x'),
    t1.Binary(
      t1.Binary('c', 'd', 'z'),
      'f',
      'y'
    ),
    'w'
  )

  it('should strip all relation fields', () => {
    const {convert} = spec1()
    const {builder: t2} = spec2()

    const visitor = {
      Binary (path) {
        const {left, right} = path.node
        return t2.Binary(left, right)
      }
    }

    const convertTree = convert(visitor)

    expect(convertTree(tree)).to.deep.equal(t2.Binary(
      t2.Binary('a', 'b'),
      t2.Binary(
        t2.Binary('c', 'd'),
        'f'
      )
    ))
  })

  it('should strip all relations and swap left and right', () => {
    const {convert} = spec1()
    const {builder: t2} = spec2()

    const visitor = {
      Binary (path) {
        const {left, right} = path.node
        return t2.Binary(right, left)
      }
    }

    const convertTree = convert(visitor)

    expect(convertTree(tree)).to.deep.equal(t2.Binary(
      t2.Binary(
        'f',
        t2.Binary('d', 'c')
      ),
      t2.Binary('b', 'a')
    ))
  })
})
