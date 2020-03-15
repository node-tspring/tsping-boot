import { PropertySource, Implements } from '@tspring/core'
import { ConfigurationPropertySource } from './ConfigurationPropertySource'
import { OriginLookup } from '../../../../origin/OriginLookup'
import { ConfigurationProperty } from './ConfigurationProperty'
import { Origin } from '../../../../origin/Origin'

@Implements(OriginLookup)
export class ConfigurationPropertySourcesPropertySource extends PropertySource<Iterable<ConfigurationPropertySource>>
		implements OriginLookup<string> {

  getOrigin(name: string): Origin | undefined {
		return Origin.from(this.findConfigurationProperty(name))
  }

  constructor(name: string, source: Iterable<ConfigurationPropertySource>) {
    super(name, source)
  }

  getProperty(name: string): Object | undefined {
    const configurationProperty = this.findConfigurationProperty(name)
		return (configurationProperty != undefined) ? configurationProperty.getValue() : undefined
  }

  private findConfigurationProperty(name: string ): ConfigurationProperty | undefined {
    if (name == undefined) {
      return undefined
    }
    let count = 0
    for (const configurationPropertySource of this.getSource()) {
      const configurationProperty = configurationPropertySource.getConfigurationProperty(name)
      if (configurationProperty != undefined) {
        return configurationProperty
      }
    }
    return undefined
	}
}
