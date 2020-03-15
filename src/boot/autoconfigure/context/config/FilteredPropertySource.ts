import { PropertySource, ConfigurableEnvironment, Consumer } from '@tspring/core'

export class FilteredPropertySource extends PropertySource<PropertySource<Object>> {
  private filteredProperties: Set<string>

  constructor(original: PropertySource<Object>, filteredProperties: Set<string>) {
		super(original.getName(), original)
		this.filteredProperties = filteredProperties
  }

  getProperty(name: string): Object | undefined {
		if (this.filteredProperties.has(name)) {
			return undefined
		}
		return this.getSource().getProperty(name)
	}

  static apply(
    environment: ConfigurableEnvironment,
    propertySourceName: string, filteredProperties: Set<string>,
    operation: Consumer<PropertySource<Object>>) {

    const propertySources = environment.getPropertySources()
    const original = propertySources.get(propertySourceName)
    if (original == undefined) {
      operation.accept(undefined)
      return
    }
    propertySources.replace(propertySourceName, new FilteredPropertySource(original, filteredProperties))
    try {
      operation.accept(original)
    }
    finally {
      propertySources.replace(propertySourceName, original)
    }
  }
}
