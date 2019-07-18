import { isDevMode } from '@angular/core'
import { OperatorFunction, Observable, MonoTypeOperatorFunction } from 'rxjs'
import { map, tap, filter } from 'rxjs/operators'

import { TypedActionWithCorrelation } from './correlate-action'

export function correlate<R extends TypedActionWithCorrelation<string> = TypedActionWithCorrelation<string>>(
  ...operators: OperatorFunction<any, any>[]
): OperatorFunction<any, R> {
  return function(arg: any): Observable<R> {
    if (operators.length === 0) {
      throw new TypeError('Expected operators, received nothing')
    }

    const [head, ...tail] = operators

    let trigger: any
    const assignTrigger = arg.pipe(tap((input: any): void => (trigger = input)))

    const result = tail.reduce((composed, fn): Observable<R> => fn(composed), head(assignTrigger))
    return result.pipe(
      map(
        (output): R => {
          if (trigger && trigger.__correlationId) {
            const actionWithCorrelation = {
              ...output,
              __correlationId: trigger.__correlationId,
            }
            logCorrelation(trigger, actionWithCorrelation)
            return actionWithCorrelation
          }

          return output
        },
      ),
    )
  }
}

export function withSameCorrelationAs<T extends string>(
  action: TypedActionWithCorrelation<string>,
): MonoTypeOperatorFunction<TypedActionWithCorrelation<T>> {
  return filter((input: TypedActionWithCorrelation<T>): boolean => input.__correlationId === action.__correlationId)
}

/**
 * Can be useful for debugging purposes -
 * Which action triggered another action?
 */
function logCorrelation<
  T extends TypedActionWithCorrelation<string> = TypedActionWithCorrelation<string>,
  O extends TypedActionWithCorrelation<string> = TypedActionWithCorrelation<string>
>(trigger: T, output: O): void {
  if (isDevMode()) {
    let correlations = (window as any)._actionCorrelations || {}
    correlations[trigger.__correlationId] = (correlations[trigger.__correlationId] || [trigger]).concat(output)
    ;(window as any)._actionCorrelations = correlations
  }
}
