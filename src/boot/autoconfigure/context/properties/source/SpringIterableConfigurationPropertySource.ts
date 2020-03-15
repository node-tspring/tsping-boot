import { SpringConfigurationPropertySource } from './SpringConfigurationPropertySource'
import { IterableConfigurationPropertySource } from './IterableConfigurationPropertySource'
import { PropertyMapper } from './PropertyMapper'
import { EnumerablePropertySource, CollectionUtils, Implements } from '@tspring/core'
import { PropertyMapping } from './PropertyMapping'

@Implements(IterableConfigurationPropertySource)
export class SpringIterableConfigurationPropertySource extends SpringConfigurationPropertySource implements IterableConfigurationPropertySource {

  [Symbol.iterator](): Iterator<string> {
    return this.getConfigurationPropertyNames()[Symbol.iterator]()
  }

  constructor(propertySource: EnumerablePropertySource<Object>, mapper: PropertyMapper) {
		super(propertySource, mapper, undefined)
		this.assertEnumerablePropertySource()
  }

  private getPropertyMappings(cache: any): PropertyMapping[] {
		// const result = (cache != undefined) ? cache.getMappings() : undefined
		// if (result != undefined) {
		// 	return result
		// }
		const names = this.getPropertySource().getPropertyNames()
		const mappings: PropertyMapping[] =[]
		for (const name of names) {
			CollectionUtils.addAll(mappings, this.getMapper().map(name))
		}
		let result = mappings // mappings.toArray(new PropertyMapping[0])
		// if (cache != undefined) {
		// 	cache.setMappings(result)
		// }
		return result
  }

  protected getPropertySource(): EnumerablePropertySource<Object> {
		return super.getPropertySource() as EnumerablePropertySource<Object>
	}

  private getConfigurationPropertyNames(): string[] {
		// const cache = this.getCache()
		// let names = (cache != undefined) ? cache.getNames() : undefined
		// if (names != undefined) {
		// 	return names
		// }
		const mappings = this.getPropertyMappings(undefined/* cache */)
		let names: string[] = []
		for (const mapping of mappings) {
			names.push(mapping.getConfigurationPropertyName())
		}
		// names = Collections.unmodifiableList(names)
		// if (cache != undefined) {
		// 	cache.setNames(names)
		// }
		return names
  }

  private assertEnumerablePropertySource() {

  }
}
