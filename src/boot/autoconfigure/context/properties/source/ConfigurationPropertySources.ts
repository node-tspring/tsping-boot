import { isImplements, ConfigurableEnvironment, Environment, CollectionUtils, PropertySource } from '@tspring/core'
import { ConfigurationPropertySourcesPropertySource } from './ConfigurationPropertySourcesPropertySource'
import { SpringConfigurationPropertySources } from './SpringConfigurationPropertySources'
import { SpringConfigurationPropertySource } from './SpringConfigurationPropertySource'

const ATTACHED_PROPERTY_SOURCE_NAME = 'configurationProperties'

export class ConfigurationPropertySources {
  static readonly ATTACHED_PROPERTY_SOURCE_NAME = ATTACHED_PROPERTY_SOURCE_NAME

  static attach(environment: Environment) {
    if (!isImplements<ConfigurableEnvironment>(environment, ConfigurableEnvironment)) throw Error('environment instance type error.')

		const sources = environment.getPropertySources()
		let attached = sources.get(ATTACHED_PROPERTY_SOURCE_NAME)
		if (attached != undefined && attached.getSource() != sources) {
			sources.remove(ATTACHED_PROPERTY_SOURCE_NAME)
			attached = undefined
		}
		if (attached == undefined) {
			sources.addFirst(new ConfigurationPropertySourcesPropertySource(ATTACHED_PROPERTY_SOURCE_NAME,
					new SpringConfigurationPropertySources(sources)))
		}
	}

	static from(source: PropertySource<Object>) {
		return CollectionUtils.singleton(SpringConfigurationPropertySource.from(source))
	}
}
