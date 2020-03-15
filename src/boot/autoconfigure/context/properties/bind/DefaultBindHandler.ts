import { Implements } from '@tspring/core'
import { BindHandler } from './BindHandler'
import { Bindable } from './Bindable'

@Implements(BindHandler)
export class DefaultBindHandler implements BindHandler {
  onStart<T>(name: string, target: Bindable<T>, context: any): Bindable<T> {
    return target
  }

  onSuccess(name: string, target: Bindable<Object>, context: any, result: Object): Object {
    return result
  }

  onCreate(name: string, target: Bindable<Object>, context: any, result: Object): Object {
    return result
  }

  onFailure(name: string, target: Bindable<Object>, context: any, error: Error): Object {
		throw error
  }

  onFinish(name: string, target: Bindable<Object>, context: any, result: Object): void {

  }
}
