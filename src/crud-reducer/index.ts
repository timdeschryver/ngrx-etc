import {
  ActionReducer,
  createFeatureSelector,
  createSelector,
  createAction,
  props,
  createReducer,
  on,
} from '@ngrx/store'

// Not exported by @ngrx/store
export interface On<State> {
  reducer: ActionReducer<State>
  types: string[]
}

export interface CrudReducerState<Entity> {
  entities: Record<string, Entity>
  keys: string[]
}

export function createCrudReducer<Entity, State extends CrudReducerState<Entity> = CrudReducerState<Entity>>(
  stateKey: string,
  entityKey: keyof Entity,
  ons: On<State>[] = [],
) {
  const selectState = createFeatureSelector<State>(stateKey)

  const selectEntitiesArray = createSelector(
    selectState,
    ({ entities, keys }): Entity[] =>
      Object.keys(entities)
        .filter(key => keys.includes(key))
        .map(key => entities[key]),
  )

  const selectEntitiesMap = createSelector(
    selectEntitiesArray,
    entities =>
      entities.reduce(
        (record, entity): Record<string, Entity> => {
          const key = '' + entity[entityKey]
          record[key] = entity
          return record
        },
        {} as Record<string, Entity>,
      ),
  )

  const upsert = createAction(`[${stateKey}] Upsert`, props<{ entities: Entity | Entity[] }>())
  const remove = createAction(`[${stateKey}] Delete`, props<{ keys: string | string[] }>())

  const reducer = createReducer<State>(
    {
      entities: {},
      keys: [],
    } as any,
    on(upsert, (state, { entities }) => {
      let upsertedEntities: Record<string, Entity> = {}

      function createEntity(entity: Entity) {
        const key = '' + entity[entityKey]
        upsertedEntities[key] = entity
      }

      if (Array.isArray(entities)) {
        entities.forEach(createEntity)
      } else {
        createEntity(entities)
      }

      return {
        ...state,
        entities: {
          ...state.entities,
          ...upsertedEntities,
        },
        keys: [...new Set([...state.keys, ...Object.keys(upsertedEntities)])],
      }
    }),
    on(remove, (state, { keys }) => {
      return {
        ...state,
        keys: state.keys.filter(key => !keys.includes(key)),
      }
    }),
    ...ons,
  )

  return {
    stateKey,
    selectState,
    selectEntitiesArray,
    selectEntitiesMap,
    upsert,
    remove,
    reducer,
  }
}
