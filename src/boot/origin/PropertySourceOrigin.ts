import { Origin } from './Origin'
import { OriginLookup } from './OriginLookup'
import { PropertySource, Implements } from '@tspring/core'

@Implements(Origin)
export class PropertySourceOrigin implements Origin {
  private propertySource: PropertySource<Object>
  private propertyName: string
  constructor(propertySource: PropertySource<Object>, propertyName: string) {
		this.propertySource = propertySource
		this.propertyName = propertyName
  }

  static get(propertySource: PropertySource<Object>, name: string) {
		const origin = OriginLookup.getOrigin(propertySource, name)
		return (origin != null) ? origin : new PropertySourceOrigin(propertySource, name)
	}
}
