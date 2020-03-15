import { Interface } from '@tspring/core'

export interface PlaceholdersResolver {

  resolvePlaceholders(value: Object): Object

}

export const PlaceholdersResolver = new (class extends Interface{
  readonly NONE: PlaceholdersResolver = { resolvePlaceholders: (value: Object) => value }
})('PlaceholdersResolver')
