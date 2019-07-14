import { Action } from '@ngrx/store'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { of, merge, Subject, zip, Observable, throwError } from 'rxjs'
import { mapTo, flatMap, take, shareReplay, switchMap, catchError, exhaustMap, map } from 'rxjs/operators'

import { correlate, createActionWithCorrelation, withSameCorrelationAs } from '../../src'

test('it adds the correlation an id', () => {
  const trigger = one()
  const actions = of(trigger)
  const effects = new EffectsFixture(actions, successService)

  const dispatchedActions: Action[] = []
  effects.one.subscribe(action => dispatchedActions.push(action))

  expect(dispatchedActions).toEqual([
    {
      type: 'TWO',
      number: 2,
      __correlationId: trigger.__correlationId,
    },
  ])
})

test('it adds the correlation an id to multiple outputs', () => {
  const trigger = one()
  const actions = of(trigger)
  const effects = new EffectsFixture(actions, successService)

  const dispatchedActions: Action[] = []
  effects.twotwo.subscribe(action => dispatchedActions.push(action))

  expect(dispatchedActions).toEqual([
    {
      type: 'TWO',
      number: 2,
      __correlationId: trigger.__correlationId,
    },
    {
      type: 'TWO-TWO',
      number: 22,
      __correlationId: trigger.__correlationId,
    },
  ])
})

test('it does not add a correlation an id when the trigger action does not have one', () => {
  const actions = of({ type: 'NO CORRELATION IN' })
  const effects = new EffectsFixture(actions, successService)

  const dispatchedActions: Action[] = []
  effects.noCorrelation.subscribe(action => dispatchedActions.push(action))

  expect(dispatchedActions).toEqual([
    {
      type: 'NO CORRELATION OUT',
    },
  ])
})

describe('integration tests', () => {
  test('fetching from a service with a success result', () => {
    const actions = of({ type: 'FETCH', __correlationId: 'fetch-one' })
    const effects = new EffectsFixture(actions, successService)

    const dispatchedActions: Action[] = []
    effects.fetch.subscribe(action => dispatchedActions.push(action))

    expect(dispatchedActions).toEqual([
      {
        type: 'FETCH SUCCESS',
        __correlationId: 'fetch-one',
      },
    ])
  })

  test('fetching from a service with a fail result', () => {
    const actions = of({ type: 'FETCH', __correlationId: 'fetch-one' })
    const effects = new EffectsFixture(actions, failService)

    const dispatchedActions: Action[] = []
    effects.fetch.subscribe(action => dispatchedActions.push(action))

    expect(dispatchedActions).toEqual([
      {
        type: 'FETCH FAIL',
        __correlationId: 'fetch-one',
      },
    ])
  })

  test('aggregator (https://blog.nrwl.io/ngrx-patterns-and-techniques-f46126e2b1e5)', () => {
    const trigger = one()
    const actions = new Subject<Action>()
    const effects = new EffectsFixture(actions.pipe(shareReplay()), successService)
    const dispatchedActions: Action[] = []

    merge(effects.one, effects.two, effects.five).subscribe(action => {
      dispatchedActions.push(action)
      actions.next(action)
    })

    actions.next(trigger)

    /**
     * One -> Two -> Three
     * One -> Two + Three -> Five
     */

    expect(dispatchedActions).toEqual([
      { number: 2, type: 'TWO', __correlationId: trigger.__correlationId },
      { number: 3, type: 'THREE', __correlationId: trigger.__correlationId },
      { number: 5, type: 'FIVE', __correlationId: trigger.__correlationId },
    ])
  })
})

const one = createActionWithCorrelation('ONE', () => ({ number: 1 }))
const two = createActionWithCorrelation('TWO', () => ({ number: 2 }))
const twotwo = createActionWithCorrelation('TWO-TWO', () => ({ number: 22 }))
const three = createActionWithCorrelation('THREE', () => ({ number: 3 }))
const five = createActionWithCorrelation('FIVE', () => ({ number: 5 }))

const successService = {
  fetch: jest.fn(() => of([])),
}

const failService = {
  fetch: jest.fn(() => throwError('oops')),
}

class EffectsFixture {
  one = createEffect(() => this.actions.pipe(correlate(ofType(one), mapTo(two()))))

  two = createEffect(() => this.actions.pipe(correlate(ofType(two), mapTo(three()))))

  twotwo = createEffect(() => this.actions.pipe(correlate(ofType(one), flatMap(() => [two(), twotwo()]))))

  noCorrelation = createEffect(() =>
    this.actions.pipe(correlate(ofType('NO CORRELATION IN'), mapTo({ type: 'NO CORRELATION OUT' }))),
  )

  fetch = createEffect(() =>
    this.actions.pipe(
      correlate(
        ofType('FETCH'),
        exhaustMap(() =>
          this.service.fetch().pipe(
            map(() => ({ type: 'FETCH SUCCESS' })),
            catchError(() => of({ type: 'FETCH FAIL' })),
          ),
        ),
      ),
    ),
  )

  five = createEffect(() =>
    this.actions.pipe(
      correlate(
        ofType(one),
        flatMap(a =>
          zip(
            this.actions.pipe(
              ofType(two),
              withSameCorrelationAs(a),
              take(1),
            ),
            this.actions.pipe(
              ofType(three),
              withSameCorrelationAs(a),
              take(1),
            ),
          ),
        ),
        mapTo(five()),
      ),
    ),
  )

  constructor(private actions: Actions, private service: { fetch: () => Observable<any> }) {}
}
