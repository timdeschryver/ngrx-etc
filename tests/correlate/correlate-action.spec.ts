import { props } from '@ngrx/store'

import { createActionWithCorrelation } from '../../src'

describe('empty action', () => {
  test('creates a type property', () => {
    const action = createActionWithCorrelation('action-type')
    expect(action.type).toBe('action-type')
  })

  test('creates a the action', () => {
    const action = createActionWithCorrelation('action-type')

    const output = action()
    expect(output).toEqual({
      type: 'action-type',
      __correlationId: expect.any(String),
    })
  })
})

describe('action with props', () => {
  test('creates a type property', () => {
    const action = createActionWithCorrelation('action-type', props<{ amount: number }>())

    expect(action.type).toBe('action-type')
  })

  test('creates a the action', () => {
    const action = createActionWithCorrelation('action-type', props<{ amount: number }>())

    const output = action({ amount: 47 })
    expect(output).toEqual({
      type: 'action-type',
      amount: 47,
      __correlationId: expect.any(String),
    })
  })
})

describe('action with function', () => {
  test('creates a type property', () => {
    const action = createActionWithCorrelation('action-type', (amount: number) => ({ amount, name: 'alice' }))

    expect(action.type).toBe('action-type')
  })

  test('creates a the action', () => {
    const action = createActionWithCorrelation('action-type', (amount: number) => ({ amount, name: 'alice' }))

    const output = action(47)
    expect(output).toEqual({
      type: 'action-type',
      amount: 47,
      name: 'alice',
      __correlationId: expect.any(String),
    })
  })
})
