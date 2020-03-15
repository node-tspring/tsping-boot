import { Bindable } from './Bindable'
import { Context } from './Binder'
import { DataObjectPropertyBinder } from './DataObjectPropertyBinder'
import { Interface } from '@tspring/core'

export interface DataObjectBinder {
  bind<T>(name: string, target: Bindable<T>, context: Context, propertyBinder: DataObjectPropertyBinder ): T

	create<T>(target: Bindable<T>, contxt: Context): T
}

export const DataObjectBinder = new Interface('DataObjectBinder')
