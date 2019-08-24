# NgRx-etc
[![All Contributors](https://img.shields.io/badge/all_contributors-2-orange.svg?style=flat-square)](#contributors)

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

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
<table>
  <tr>
    <td align="center"><a href="http://timdeschryver.dev"><img src="https://avatars1.githubusercontent.com/u/28659384?v=4" width="100px;" alt="Tim Deschryver"/><br /><sub><b>Tim Deschryver</b></sub></a><br /><a href="https://github.com/timdeschryver/ngrx-etc/commits?author=timdeschryver" title="Code">💻</a> <a href="https://github.com/timdeschryver/ngrx-etc/commits?author=timdeschryver" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://www.webtrix.be"><img src="https://avatars1.githubusercontent.com/u/4103756?v=4" width="100px;" alt="Maarten Tibau"/><br /><sub><b>Maarten Tibau</b></sub></a><br /><a href="https://github.com/timdeschryver/ngrx-etc/commits?author=maartentibau" title="Documentation">📖</a></td>
  </tr>
</table>

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!