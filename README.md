# NgRx-etc

## `mutableOn`

Without the `mutableOn` function our `entityReducer` would look something like this.

```ts
const entityReducer = createReducer<{ entities: Record<number, { id: number; name: string }> }>(
  {
    entities: {},
  },
  on(create, (state, { type, ...entity }) => ({ 
    ...state, 
    entities: { ...state.entities, [entity.id]: entity }
  }),
  on(update, (state, { id, newName }) => {
    const entity = state.entities[id]
  
    if (entity) {
      return { 
        ...state, 
        entities: { 
          ...state.entities, 
          [entity.id]: { ...entity, name: newName } 
        }
      }
    }
    
    return state;
  },
  on(remove, (state, { id }) => {
    const { [id]: removedEntity, ...rest } = state.entities;
    
    return { ...state, entities: rest };
  }),
)
```

With the `mutableOn` function we are able to directly perform state mutations in reducers with less noise, and more concise code.

```ts
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
  mutableOn(remove, (state, { id }) => {
    delete state.entities[id]
  }),
)
```
