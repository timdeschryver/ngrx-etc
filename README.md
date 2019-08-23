# NgRx-etc

## `mutableOn`

The `mutableOn` function offers direct state mutations in reducers.

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
  mutableOn(delete, (state, { id }) => {
    delete state.entities[id]
  }),
)
```
