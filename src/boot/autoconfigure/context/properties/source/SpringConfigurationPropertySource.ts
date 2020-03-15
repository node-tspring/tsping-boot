import { ConfigurationPropertySource } from './ConfigurationPropertySource'
import { ConfigurationProperty } from './ConfigurationProperty'
import { PropertySource, SystemEnvironmentPropertySource, StandardEnvironment, Implements, CollectionUtils, EnumerablePropertySource, Class } from '@tspring/core'
import { PropertyMapper } from './PropertyMapper'
import { PropertyMapping } from './PropertyMapping'
import { SystemEnvironmentPropertyMapper } from './SystemEnvironmentPropertyMapper'
import { DefaultPropertyMapper } from './DefaultPropertyMapper'
import { PropertySourceOrigin } from '../../../../origin/PropertySourceOrigin'
import { SpringIterableConfigurationPropertySource } from './SpringIterableConfigurationPropertySource'

@Implements(PropertyMapper)
class DelegatingPropertyMapper implements PropertyMapper {

  private static readonly NONE: PropertyMapping[] = []

  private first: PropertyMapper

  private second?: PropertyMapper

  constructor(first: PropertyMapper, second?: PropertyMapper) {
    this.first = first
    this.second = second
  }

  map(propertySourceName: string): PropertyMapping[] {
    const first = this.$map(this.first, propertySourceName)
    const second = this.$map(this.second, propertySourceName)
    return this.merge(first, second)
  }

  private $map(mapper: PropertyMapper | undefined, propertySourceName: string) {
    try {
      return (mapper != undefined) ? mapper.map(propertySourceName) : DelegatingPropertyMapper.NONE
    }
    catch (ex) {
      return DelegatingPropertyMapper.NONE
    }
  }

  private merge(first: PropertyMapping[], second: PropertyMapping[]): PropertyMapping[] {
    if (second.length == 0) {
      return first
    }
    if (first.length == 0) {
      return second
    }
    return first.concat(second)
  }

}

function hasSystemEnvironmentName(source: PropertySource<Object>) {
  const name = source.getName()
  return StandardEnvironment.SYSTEM_ENVIRONMENT_PROPERTY_SOURCE_NAME == name
      || name.endsWith('-' + StandardEnvironment.SYSTEM_ENVIRONMENT_PROPERTY_SOURCE_NAME)
}

function getPropertyMapper(source: PropertySource<Object>) {
  if (source instanceof SystemEnvironmentPropertySource && hasSystemEnvironmentName(source)) {
    return new DelegatingPropertyMapper(
      SystemEnvironmentPropertyMapper.INSTANCE,
      DefaultPropertyMapper.INSTANCE
    )
  }
  return new DelegatingPropertyMapper(DefaultPropertyMapper.INSTANCE)
}

@Implements(ConfigurationPropertySource)
export class SpringConfigurationPropertySource implements ConfigurationPropertySource {
  private mapper: PropertyMapper
  private propertySource: PropertySource<Object>

  constructor(
    propertySource: PropertySource<Object>,
    mapper: PropertyMapper,
    containsDescendantOf: any // (name: ConfigurationPropertyName) => ConfigurationPropertyState
  ) {

    this.propertySource = propertySource
    this.mapper = (mapper instanceof DelegatingPropertyMapper) ? mapper : new DelegatingPropertyMapper(mapper)
    // this.containsDescendantOf = containsDescendantOf != undefined
    //   ? containsDescendantOf
    //   : (n) => ConfigurationPropertyState.UNKNOWN
  }

  getConfigurationProperty(name: string): ConfigurationProperty | undefined {
    const mappings = this.getMapper().map(name)
		return this.find(mappings, name)
  }

  protected find(mappings: PropertyMapping[], name: string) {
		for (const candidate of mappings) {
			if (candidate.isApplicable(name)) {
				const result = this.$find(candidate)
				if (result != undefined) {
					return result
				}
			}
		}
		return undefined
	}

  private $find(mapping: PropertyMapping) {
		const propertySourceName = mapping.getPropertySourceName()
		const value = this.getPropertySource().getProperty(propertySourceName)
		if (value == undefined) {
			return undefined
		}
		const configurationPropertyName = mapping.getConfigurationPropertyName()
		const origin = PropertySourceOrigin.get(this.propertySource, propertySourceName)
		return ConfigurationProperty.of(configurationPropertyName, value, origin)
  }

  protected getPropertySource() {
		return this.propertySource
	}

  protected getMapper() {
		return this.mapper
  }

  getUnderlyingSource(): Object {
		return this.propertySource
  }

  static from(source: PropertySource<Object>) {
		const mapper = getPropertyMapper(source)
    return new (Class.require<typeof SpringIterableConfigurationPropertySource>('@tspring/boot:SpringIterableConfigurationPropertySource'))
      (source as EnumerablePropertySource<Object>, mapper)
	}
}
