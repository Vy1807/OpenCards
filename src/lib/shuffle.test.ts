import { describe, it, expect } from 'vitest'
import { shuffle } from '../lib/shuffle'

describe('shuffle', () => {
  it('returns a permutation of the input (same elements, same count)', () => {
    const input = [1, 2, 3, 4, 5]
    const result = shuffle(input)

    expect(result).toHaveLength(input.length)
    expect([...result].sort()).toEqual([...input].sort())
  })

  it('does not mutate the input array', () => {
    const input = [1, 2, 3, 4, 5]
    const before = [...input]
    shuffle(input)
    expect(input).toEqual(before)
  })

  it('returns a new array reference', () => {
    const input = [1, 2, 3]
    expect(shuffle(input)).not.toBe(input)
  })

  it('handles empty array', () => {
    expect(shuffle([])).toEqual([])
  })

  it('handles single element', () => {
    expect(shuffle([42])).toEqual([42])
  })
})
