import { Interface } from '@tspring/core'
import { Bindable } from './Bindable'
import { BindContext } from './BindContext'

export interface BindHandler {
  onStart<T>(name: string, target: Bindable<T>, context: BindContext): Bindable<T>
  onSuccess(name: string, target: Bindable<Object>, context: BindContext, result: Object | undefined): Object
  onCreate(name: string, target: Bindable<Object>, context: BindContext, result: Object | undefined): Object
  onFailure(name: string, target: Bindable<Object>, context: BindContext, error: Error | undefined): Object
  onFinish(name: string, target: Bindable<Object>, context: BindContext, result: Object | undefined): void
}

export const BindHandler = new Interface('BindHandler')


