import { Bindable } from './Bindable'
import { Interface } from '@tspring/core'

export interface DataObjectPropertyBinder {
	bindProperty(propertyName: string, target: Bindable<Object>): Object
}

export const DataObjectPropertyBinder = new Interface('DataObjectPropertyBinder')
