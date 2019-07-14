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
  mutableOn(deleete, (state, { id }) => {
    delete state.entities[id]
  }),
)
```

## Correlation

### `createActionWithCorrelation`

Creates an `ActionCreator` to create an `Action` with a `__correlationId` property, which is a unique.
The `createActionWithCorrelation` function has the same signature as `createAction`, but when executed returns a `TypedActionWithCorrelation`.

```ts
export declare interface TypedActionWithCorrelation<T extends string> extends TypedAction<T> {
  __correlationId: string
}
```

```ts
const actionEmpty = createActionWithCorrelation('[CUSTOMERS PAGE]: Load customers')
actionEmpty() // -> ({ type: '[CUSTOMERS PAGE]: Load customers', __correlationId: '1563057826796'})

const actionProps = createActionWithCorrelation('[CUSTOMERS PAGE]: Load customer', props<{ id: string }>())
actionProps({ id: '47' }) // -> ({ type: '[CUSTOMERS PAGE]: Load customer', id: '47', __correlationId: '1563057826796'})

const actionFunction = createActionWithCorrelation('[CUSTOMERS PAGE]: Load customer', (id: string) => ({ id }))
actionFunction('47') // -> ({ type: '[CUSTOMERS PAGE]: Load customer', id: '47', __correlationId: '1563057826796'})
```

### `correlate`

Wrap the operators with `correlate` to captures the input `Action`.
If the input `Action` has a correlation id, the correlation id will be added to the output `Action`.

```ts
one = createEffect(() => this.actions.pipe(
  correlate(
    ofType(loadCustomers),
    exhaustMap(() =>
      return this.service.loadCustomers.pipe(
        map(customers => loadCustomersSuccess(customers)),
        catchError(err => loadCustomersFail(err)),
      )
    )
  )
))

// INPUT: { type: '[CUSTOMERS PAGE]: Load customers', __correlationId: '1563060201065' }
// OUTPUT (SUCCESS): { type: '[CUSTOMERS API]: Load customers success', customers: [...], __correlationId: '1563060201065' }
// OUTPUT (FAIL): { type: '[CUSTOMERS API]: Load customers fail', message: '500: Internal Server Error', __correlationId: '1563060201065' }
```

### `withSameCorrelationAs`

An implementation of the RxJS `filter` operator to check if the input `Action`'s `__correlationId` is equal to the next `Action`'s `__correlationId`.
