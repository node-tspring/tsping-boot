import { PropertyMapper } from './PropertyMapper'
import { PropertyMapping } from './PropertyMapping'
import { Implements, ObjectUtils } from '@tspring/core'

class LastMapping<T> {

  private from: T

  private mapping: PropertyMapping[]

  constructor(from: T, mapping: PropertyMapping[]) {
    this.from = from
    this.mapping = mapping
  }

  isFrom(from: T) {
    return ObjectUtils.nullSafeEquals(from, this.from)
  }

  getMapping() {
    return this.mapping
  }
}

@Implements(PropertyMapper)
export class DefaultPropertyMapper implements PropertyMapper {
  static readonly INSTANCE = new DefaultPropertyMapper()
	private lastMappedPropertyName?: LastMapping<string>

  map(propertySourceName: string): PropertyMapping[] {
    const last = this.lastMappedPropertyName
		if (last != undefined && last.isFrom(propertySourceName)) {
			return last.getMapping()
		}
		const mapping = this.tryMap(propertySourceName)
		this.lastMappedPropertyName = new LastMapping(propertySourceName, mapping)
		return mapping
  }

  private tryMap(propertySourceName: string): PropertyMapping[]  {
		try {
      return [new PropertyMapping(propertySourceName, propertySourceName)]
		}
		catch (ex) {
		}
		return PropertyMapper.NO_MAPPINGS
	}
}
