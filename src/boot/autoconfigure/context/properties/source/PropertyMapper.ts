import { PropertyMapping } from './PropertyMapping'
import { Interface } from '@tspring/core'

export interface PropertyMapper {
	map(propertySourceName: string): PropertyMapping[]
}

export const PropertyMapper = new (class extends Interface{
  readonly NO_MAPPINGS: PropertyMapping[] = []
})('PropertyMapper')
