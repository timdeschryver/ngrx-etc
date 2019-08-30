import { createAction, props } from '@ngrx/store'

import { createCrudReducer, CrudReducerState, mutableOn } from '../../src'

test('it has default actions, selectors, and is extensible', () => {
  interface Todo {
    id: string
    description: string
    done: boolean
  }

  interface TodoState extends CrudReducerState<Todo> {
    selectedId: string
  }

  const selectTodo = createAction('[todos] Select', props<{ id: string }>())

  const { reducer, upsert, remove, selectEntitiesArray, selectEntitiesMap } = createCrudReducer<Todo, TodoState>(
    'todos',
    'id',
    [
      mutableOn(selectTodo, (state, { id }) => {
        state.selectedId = id
      }),
    ],
  )

  const todos = [
    { id: 'A', description: 'My first todo', done: false },
    { id: 'B', description: 'My second todo', done: false },
    { id: 'C', description: 'My third todo', done: false },
    { id: 'C', description: 'My third todo (done)', done: true },
  ]

  const actions = [
    upsert({ entities: todos[0] }),
    upsert({
      entities: [todos[1], todos[2]],
    }),
    remove({ keys: 'B' }),
    upsert({
      entities: todos[3],
    }),
    selectTodo({ id: 'C' }),
  ]

  const stateTree = {
    todos: actions.reduce(reducer, undefined),
  }

  expect(selectEntitiesArray(stateTree)).toEqual([todos[0], todos[3]])
  expect(selectEntitiesMap(stateTree)).toEqual({
    A: todos[0],
    C: todos[3],
  })
  expect((stateTree.todos as TodoState).selectedId).toBe('C')
})
