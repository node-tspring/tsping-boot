import { Binder } from './Binder'
import { ConfigurationPropertySource } from '../source/ConfigurationPropertySource'
import { ConfigurationProperty } from '../source/ConfigurationProperty'
import { Interface } from '@tspring/core'

export interface BindContext {
	getBinder(): Binder
	getDepth(): number
	getSources(): Iterable<ConfigurationPropertySource>
	getConfigurationProperty(): ConfigurationProperty | undefined
}

export const BindContext = new Interface('BindContext')
