import { isDevMode } from '@angular/core'
import { MonoTypeOperatorFunction, UnaryFunction, Observable, of } from 'rxjs'
import { map, filter, mergeMap } from 'rxjs/operators'
import { pipeFromArray } from 'rxjs/internal/util/pipe'
import { Action } from '@ngrx/store'

import { TypedActionWithCorrelation } from './correlate-action'

export function correlate<T, A>(fn1: UnaryFunction<T, A>): UnaryFunction<T, A>
export function correlate<T, A, B>(fn1: UnaryFunction<T, A>, fn2: UnaryFunction<A, B>): UnaryFunction<T, B>
export function correlate<T, A, B, C>(
  fn1: UnaryFunction<T, A>,
  fn2: UnaryFunction<A, B>,
  fn3: UnaryFunction<B, C>,
): UnaryFunction<T, C>
export function correlate<T, A, B, C, D>(
  fn1: UnaryFunction<T, A>,
  fn2: UnaryFunction<A, B>,
  fn3: UnaryFunction<B, C>,
  fn4: UnaryFunction<C, D>,
): UnaryFunction<T, D>
export function correlate<T, A, B, C, D, E>(
  fn1: UnaryFunction<T, A>,
  fn2: UnaryFunction<A, B>,
  fn3: UnaryFunction<B, C>,
  fn4: UnaryFunction<C, D>,
  fn5: UnaryFunction<D, E>,
): UnaryFunction<T, E>
export function correlate<T, A, B, C, D, E, F>(
  fn1: UnaryFunction<T, A>,
  fn2: UnaryFunction<A, B>,
  fn3: UnaryFunction<B, C>,
  fn4: UnaryFunction<C, D>,
  fn5: UnaryFunction<D, E>,
  fn6: UnaryFunction<E, F>,
): UnaryFunction<T, F>
export function correlate<T, A, B, C, D, E, F, G>(
  fn1: UnaryFunction<T, A>,
  fn2: UnaryFunction<A, B>,
  fn3: UnaryFunction<B, C>,
  fn4: UnaryFunction<C, D>,
  fn5: UnaryFunction<D, E>,
  fn6: UnaryFunction<E, F>,
  fn7: UnaryFunction<F, G>,
): UnaryFunction<T, G>
export function correlate<T, A, B, C, D, E, F, G, H>(
  fn1: UnaryFunction<T, A>,
  fn2: UnaryFunction<A, B>,
  fn3: UnaryFunction<B, C>,
  fn4: UnaryFunction<C, D>,
  fn5: UnaryFunction<D, E>,
  fn6: UnaryFunction<E, F>,
  fn7: UnaryFunction<F, G>,
  fn8: UnaryFunction<G, H>,
): UnaryFunction<T, H>
export function correlate<T, A, B, C, D, E, F, G, H, I>(
  fn1: UnaryFunction<T, A>,
  fn2: UnaryFunction<A, B>,
  fn3: UnaryFunction<B, C>,
  fn4: UnaryFunction<C, D>,
  fn5: UnaryFunction<D, E>,
  fn6: UnaryFunction<E, F>,
  fn7: UnaryFunction<F, G>,
  fn8: UnaryFunction<G, H>,
  fn9: UnaryFunction<H, I>,
): UnaryFunction<T, I>
export function correlate<T, A, B, C, D, E, F, G, H, I>(
  fn1: UnaryFunction<T, A>,
  fn2: UnaryFunction<A, B>,
  fn3: UnaryFunction<B, C>,
  fn4: UnaryFunction<C, D>,
  fn5: UnaryFunction<D, E>,
  fn6: UnaryFunction<E, F>,
  fn7: UnaryFunction<F, G>,
  fn8: UnaryFunction<G, H>,
  fn9: UnaryFunction<H, I>,
  ...fns: UnaryFunction<any, any>[]
): UnaryFunction<T, {}>

export function correlate<R extends TypedActionWithCorrelation<string> | Action>(
  ...operators: UnaryFunction<any, any>[]
): any {
  if (operators.length === 0) {
    throw new TypeError('Expected operators, received nothing')
  }

  return function <A extends Observable<any>>(stream: A): Observable<R> {
    return stream.pipe(
      mergeMap((trigger): Observable<R> => {
        return of(trigger).pipe(
          pipeFromArray(operators),
          map((out: R): R => {
            if (!isCorrelation(trigger)) {
              return out
            }

            const actionWithCorrelation = {
              ...out,
              __correlationId: trigger.__correlationId,
            }
            logCorrelation(trigger, actionWithCorrelation as TypedActionWithCorrelation<string>)
            return actionWithCorrelation
          }),
        )
      }),
    )
  }
}

export function withSameCorrelationAs<T extends string>(
  action: TypedActionWithCorrelation<string>,
): MonoTypeOperatorFunction<TypedActionWithCorrelation<T>> {
  return filter((input: TypedActionWithCorrelation<T>): boolean => input.__correlationId === action.__correlationId)
}

function isCorrelation(action: Action): action is TypedActionWithCorrelation<string> {
  return action && '__correlationId' in action
}

/**
 * Can be useful for debugging purposes -
 * Which action triggered another action?
 */
function logCorrelation<
  T extends TypedActionWithCorrelation<string> = TypedActionWithCorrelation<string>,
  O extends TypedActionWithCorrelation<string> = TypedActionWithCorrelation<string>,
>(trigger: T, output: O): void {
  if (isDevMode()) {
    const correlations = (window as any)._actionCorrelations || {}
    correlations[trigger.__correlationId] = (correlations[trigger.__correlationId] || [trigger]).concat(output)
    ;(window as any)._actionCorrelations = correlations
  }
}
