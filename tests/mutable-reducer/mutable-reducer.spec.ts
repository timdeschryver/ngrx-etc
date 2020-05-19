import { createReducer, createAction, on, props } from '@ngrx/store'
import { createMutableReducer, mutableOn } from '../../src'

const newTodo = createAction('new todo', props<{ todo: string }>())
const completeTodo = createAction('complete todo', props<{ index: number }>())
const increment = createAction('increment')

const initalState = {
  todos: [{ text: 'initial todo', completed: false }],
  count: 0,
}

const mutableReducer = createMutableReducer(
  initalState,
  on(newTodo, (state, action) => {
    state.todos.push({ text: action.todo, completed: false })
    // TODO: should be possible to not return something
    return state
  }),
  on(increment, state => {
    state.count++
    return state
  }),
  on(increment, state => {
    state.count++
    return state
  }),
  mutableOn(completeTodo, (state, action) => {
    state.todos[action.index].completed = true
  }),
)

const reducer = createReducer(
  initalState,
  on(newTodo, (state, action) => {
    return {
      ...state,
      todos: [...state.todos, { text: action.todo, completed: false }],
    }
  }),
  on(increment, state => {
    return {
      ...state,
      count: state.count + 1,
    }
  }),
  on(increment, state => {
    return {
      ...state,
      count: state.count + 1,
    }
  }),
  on(completeTodo, (state, action) => {
    return {
      ...state,
      todos: state.todos.map((t, i) => (i === action.index ? { ...t, completed: true } : t)),
    }
  }),
)

test('returns initial state', () => {
  const state = mutableReducer(undefined, { type: 'init' })

  expect(state).toEqual(initalState)
})

test('handles an action', () => {
  const action = newTodo({ todo: 'my first todo' })
  const state = mutableReducer(undefined, action)
  const expected = reducer(undefined, action)

  expect(state.todos.length).toBe(2)
  expect(state).toEqual(expected)
})

test('can handle an action that is added more than once', () => {
  const action = increment()
  const state = mutableReducer(undefined, action)
  const expected = reducer(undefined, action)

  expect(state.count).toBe(2)
  expect(state).toEqual(expected)
})

test('does also handle mutableOns', () => {
  const action = completeTodo({ index: 0 })
  const state = mutableReducer(undefined, action)
  const expected = reducer(undefined, action)

  expect(state.todos[0].completed).toBe(true)
  expect(state).toEqual(expected)
})

test('smoketest', () => {
  const actions = [
    increment(),
    increment(),
    newTodo({ todo: 'do this' }),
    increment(),
    newTodo({ todo: 'do that' }),
    completeTodo({ index: 2 }),
    increment(),
    completeTodo({ index: 1 }),
    newTodo({ todo: 'and also this' }),
  ]

  const state = actions.reduce((s: any, a) => mutableReducer(s, a), undefined)
  const expected = actions.reduce((s: any, a) => reducer(s, a), undefined)

  expect(state).toEqual(expected)
  expect(state).toMatchInlineSnapshot(`
    Object {
      "count": 8,
      "todos": Array [
        Object {
          "completed": false,
          "text": "initial todo",
        },
        Object {
          "completed": true,
          "text": "do this",
        },
        Object {
          "completed": true,
          "text": "do that",
        },
        Object {
          "completed": false,
          "text": "and also this",
        },
      ],
    }
  `)
})
