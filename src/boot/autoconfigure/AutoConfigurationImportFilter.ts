import { AutoConfigurationMetadata } from './AutoConfigurationMetadata'
import { Interface } from '@tspring/core'

export interface AutoConfigurationImportFilter {
	match(autoConfigurationClasses: string[], autoConfigurationMetadata: AutoConfigurationMetadata): boolean[]
}

export const AutoConfigurationImportFilter = new Interface('AutoConfigurationImportFilter')
