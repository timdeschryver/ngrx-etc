import produce, { Draft } from 'immer'
import { ActionReducer, Action, On } from '@ngrx/store'

export function createMutableReducer<S, A extends Action = Action, D = Draft<S>>(initialState: D, ...ons: On<D>[]) {
  const map = new Map<string, ActionReducer<D, A>>()
  for (const on of ons) {
    for (const type of on.types) {
      if (map.has(type)) {
        const existingReducer = map.get(type) as ActionReducer<D, A>
        const newReducer: ActionReducer<D, A> = (state, action) => on.reducer(existingReducer(state, action), action)
        map.set(type, newReducer)
      } else {
        map.set(type, on.reducer)
      }
    }
  }

  return function (state: D = initialState, action: A) {
    return produce(state, (draft: D): D | undefined => {
      const reducer = map.get(action.type)
      return reducer ? reducer(draft, action) : undefined
    })
  }
}
