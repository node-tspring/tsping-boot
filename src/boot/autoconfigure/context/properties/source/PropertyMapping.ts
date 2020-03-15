export class PropertyMapping {
  private propertySourceName: string
  private configurationPropertyName: string

  constructor(propertySourceName: string, configurationPropertyName: string) {
		this.propertySourceName = propertySourceName
		this.configurationPropertyName = configurationPropertyName
  }

  getPropertySourceName() {
		return this.propertySourceName
  }

  getConfigurationPropertyName() {
		return this.configurationPropertyName
  }

  isApplicable(name: string) {
		return this.configurationPropertyName == name
	}
}
