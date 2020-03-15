import { PlaceholdersResolver } from './PlaceholdersResolver'
import { PropertyPlaceholderHelper, PropertySource, Environment, isImplements, SystemPropertyUtils, Implements, ConfigurableEnvironment } from '@tspring/core'

function getSources(environment: Environment) {
  return (environment as ConfigurableEnvironment).getPropertySources()
}

@Implements(PlaceholdersResolver)
export class PropertySourcesPlaceholdersResolver implements PlaceholdersResolver {
  private helper: PropertyPlaceholderHelper
  private sources: Iterable<PropertySource<any>>

  constructor(environment: Environment)
  constructor(sources: Iterable<PropertySource<Object>>)
  constructor(sources: Iterable<PropertySource<Object>>, helper: PropertyPlaceholderHelper)

  constructor(arg1: Environment | Iterable<PropertySource<Object>>, helper?: PropertyPlaceholderHelper) {
    let sources: Iterable<PropertySource<Object>>
    if (isImplements<Environment>(arg1)) {
      sources = getSources(arg1)
    }
    else {
      sources = arg1
    }
		this.sources = sources
    this.helper = helper != undefined
      ? helper
      : new PropertyPlaceholderHelper(
        SystemPropertyUtils.PLACEHOLDER_PREFIX,
        SystemPropertyUtils.PLACEHOLDER_SUFFIX,
        SystemPropertyUtils.VALUE_SEPARATOR,
        true
      )
  }

  resolvePlaceholders(value: Object): Object {
    if (typeof value == 'string') {
			return this.helper.replacePlaceholders(value, {
        resolvePlaceholder: (placeholder) => this.resolvePlaceholder(placeholder)
      })
		}
		return value
  }

  protected resolvePlaceholder(placeholder: string): string | undefined {
		if (this.sources != undefined) {
			for (const source of this.sources) {
				const value = source.getProperty(placeholder)
				if (value != undefined) {
					return value.toString()
				}
			}
		}
		return undefined
	}
}
