import {
  createReducer,
  createAction,
  on,
  ɵngrx_modules_store_store_bb as createImmutabilityCheckMetaReducer,
  props,
  ActionReducer,
  Action,
} from '@ngrx/store'
import { mutableOn } from '../../src'

test('throws with a on', () => {
  const reducer = setupReducer()
  expect(() => reducer(undefined, immutableAdd({ value: 1 }))).toThrow()
})

test('does not throw with mutableOn', () => {
  const reducer = setupReducer()
  expect(() => reducer(undefined, mutableAdd({ value: 1 }))).not.toThrow()
})

test('creates a next state', () => {
  const reducer = setupReducer()
  const state1 = reducer(undefined, mutableAdd({ value: 1 }))
  const state2 = reducer(state1, mutableAdd({ value: 2 }))
  const state3 = reducer(state2, unhandledAction())
  const state4 = reducer(state3, mutableAdd({ value: 3 }))

  expect(state1).toEqual({
    arr: [1],
    toggle: true,
  })
  expect(state2).toEqual({
    arr: [1, 2],
    toggle: false,
  })
  expect(state3).toEqual({
    arr: [1, 2],
    toggle: false,
  })
  expect(state4).toEqual({
    arr: [1, 2, 3],
    toggle: true,
  })
})

test('creates a next state in an immutable way', () => {
  const reducer = setupReducer()
  const state1 = reducer(undefined, mutableButStillImmutableAdd({ value: 1 }))
  const state2 = reducer(state1, mutableButStillImmutableAdd({ value: 2 }))
  const state3 = reducer(state2, unhandledAction())
  const state4 = reducer(state3, mutableButStillImmutableAdd({ value: 3 }))

  expect(state1).toEqual({
    arr: [1],
    toggle: true,
  })
  expect(state2).toEqual({
    arr: [1, 2],
    toggle: false,
  })
  expect(state3).toEqual({
    arr: [1, 2],
    toggle: false,
  })
  expect(state4).toEqual({
    arr: [1, 2, 3],
    toggle: true,
  })
})

test('entity reducer', () => {
  let counter = 0
  const create = createAction('create', (name: string) => ({ id: ++counter, name }))
  const update = createAction('update', props<{ id: number; newName: string }>())
  const deleete = createAction('delete', props<{ id: number }>())

  const entityReducer = createReducer<{ entities: Record<number, { id: number; name: string }> }>(
    {
      entities: {},
    },
    mutableOn(create, (state, { type, ...entity }) => {
      state.entities[entity.id] = entity
    }),
    mutableOn(update, (state, { id, newName }) => {
      const entity = state.entities[id]
      if (entity) {
        entity.name = newName
      }
    }),
    mutableOn(deleete, (state, { id }) => {
      delete state.entities[id]
    }),
  )

  const reducer = setupReducer(entityReducer)

  const actions = [
    create('foo'),
    create('bar'),
    update({ id: 1, newName: 'foo-updated' }),
    deleete({ id: 2 }),
    create('baz'),
  ]

  const state = actions.reduce(reducer, { entities: {} })
  expect(state).toEqual({
    entities: {
      1: { id: 1, name: 'foo-updated' },
      3: { id: 3, name: 'baz' },
    },
  })
})

const immutableAdd = createAction('immutable-add', props<{ value: number }>())
const mutableAdd = createAction('mutable-add', props<{ value: number }>())
const mutableButStillImmutableAdd = createAction('immutable-mutable-add', props<{ value: number }>())
const unhandledAction = createAction('unhandles-add')

function setupReducer(
  reducer: ActionReducer<any, Action> = createReducer<{ arr: any[]; toggle: boolean }>(
    {
      arr: [],
      toggle: false,
    },
    on(immutableAdd, (state, { value }) => {
      state.arr.push(value)
      state.toggle = !state.toggle
      return state
    }),
    mutableOn(mutableAdd, (state, { value }) => {
      state.arr.push(value)
      state.toggle = !state.toggle
    }),
    mutableOn(mutableButStillImmutableAdd, (state, { value }) => {
      return {
        arr: state.arr.concat(value),
        toggle: !state.toggle,
      }
    }),
  ),
) {
  const immutabilityCheckMetaReducer = createImmutabilityCheckMetaReducer({
    strictActionImmutability: true,
    strictActionSerializability: true,
    strictStateImmutability: true,
    strictStateSerializability: true,
  })

  const reducerWithImmutableCheck = immutabilityCheckMetaReducer(reducer)
  reducerWithImmutableCheck(undefined, { type: '__init' })
  return reducerWithImmutableCheck
}
