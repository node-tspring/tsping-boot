import { PropertySource, Resource, Interface } from '@tspring/core'

export interface PropertySourceLoader {
	getFileExtensions(): string[]
	load(name: string, resource: Resource): PropertySource<Object>[]
}

export const PropertySourceLoader = new Interface('PropertySourceLoader')
