import { Creator, createAction, ActionCreator } from '@ngrx/store'
import { TypedAction, FunctionWithParametersType, DisallowArraysAndTypeProperty } from '@ngrx/store/src/models'

export interface TypedActionWithCorrelation<T extends string> extends TypedAction<T> {
  __correlationId: string
}

export function createActionWithCorrelation<T extends string>(
  type: T,
): ActionCreator<T, () => TypedActionWithCorrelation<T>>
export function createActionWithCorrelation<T extends string, P extends object>(
  type: T,
  config: {
    _as: 'props'
    _p: P
  },
): ActionCreator<T, (props: P) => P & TypedActionWithCorrelation<T>>
export function createActionWithCorrelation<T extends string, P extends any[], R extends object>(
  type: T,
  creator: Creator<P, DisallowArraysAndTypeProperty<R>>,
): FunctionWithParametersType<P, R & TypedActionWithCorrelation<T>> & TypedActionWithCorrelation<T>
export function createActionWithCorrelation<T extends string, P extends any[], R extends object>(...args: any[]): any {
  return correlateAction((createAction as any)(...args))
}

export function correlateAction<T extends string>(
  actionCreator: ActionCreator<T, () => TypedAction<T>>,
): ActionCreator<T, () => TypedActionWithCorrelation<T>>
export function correlateAction<T extends string, P extends object>(
  actionCreator: ActionCreator<T, (props: P) => P & TypedAction<T>>,
): ActionCreator<T, (props: P) => P & TypedActionWithCorrelation<T>>
export function correlateAction<T extends string, P extends any[], R extends object>(
  actionCreator: FunctionWithParametersType<P, R & TypedAction<T>> & TypedAction<T>,
): FunctionWithParametersType<P, R & TypedActionWithCorrelation<T>> & TypedActionWithCorrelation<T>

export function correlateAction<T extends string>(actionCreator: any): any {
  const creator = function correlate(...args: any[]): TypedActionWithCorrelation<T> {
    const result = actionCreator(...args)
    return { ...result, __correlationId: Date.now().toString() }
  }

  defineType(actionCreator.type, creator)

  return creator
}

function defineType(type: string, creator: Creator): Creator {
  return Object.defineProperty(creator, 'type', {
    value: type,
    writable: false,
  })
}
