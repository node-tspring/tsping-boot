import { PropertyMapper } from './PropertyMapper'
import { PropertyMapping } from './PropertyMapping'
import { Implements } from '@tspring/core'

@Implements(PropertyMapper)
export class SystemEnvironmentPropertyMapper implements PropertyMapper {
  static readonly INSTANCE = new SystemEnvironmentPropertyMapper()

  map(propertySourceName: string): PropertyMapping[] {
		return [new PropertyMapping(propertySourceName, name)]
  }
}
