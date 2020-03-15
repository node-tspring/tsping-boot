import { ConfigurationPropertySource } from './ConfigurationPropertySource'
import { PropertySource, ConfigurableEnvironment, isImplements } from '@tspring/core'
import { ConfigurationPropertySourcesPropertySource } from './ConfigurationPropertySourcesPropertySource'
import { SpringConfigurationPropertySource } from './SpringConfigurationPropertySource'

type Adapter = (propertySource: PropertySource<Object>) => ConfigurationPropertySource

class SourcesIterator implements Iterator<ConfigurationPropertySource> {

  private iterators: Iterator<PropertySource<Object>>[]

  private mNext?: ConfigurationPropertySource

  private adapter: Adapter

  constructor (iterator: Iterator<PropertySource<Object>>, adapter: Adapter) {
    this.iterators = []
    this.iterators.push(iterator)
    this.adapter = adapter
  }

  next(...args: [] | [any]): IteratorResult<ConfigurationPropertySource> {
    const value = this.fetchNext()
    this.mNext = undefined
    return {
      done: value == undefined,
      value: value!
    }
  }

  private fetchNext(): ConfigurationPropertySource | undefined {
    if (this.mNext == undefined) {
      if (this.iterators.length == 0) {
        return undefined
      }
      const candidate = this.iterators[this.iterators.length - 1].next()
      if (candidate.done) {
        // 没有元素了，使用下一个
        this.iterators.pop()
        return this.fetchNext()
      } else {
        const source = candidate.value.getSource()
        if (isImplements<ConfigurableEnvironment>(source, ConfigurableEnvironment)) {
          this.push(source)
          return this.fetchNext()
        }
        if (this.isIgnored(candidate.value)) {
          return this.fetchNext()
        }
        this.mNext = this.adapter(candidate.value)
      }
    }
    return this.mNext
  }

  private push(environment: ConfigurableEnvironment) {
    this.iterators.push(environment.getPropertySources()[Symbol.iterator]())
  }

  private isIgnored(candidate: PropertySource<Object>) {
    return (candidate instanceof PropertySource.StubPropertySource
        || candidate instanceof ConfigurationPropertySourcesPropertySource)
  }

}

export class SpringConfigurationPropertySources implements Iterable<ConfigurationPropertySource> {

  [Symbol.iterator](): Iterator<ConfigurationPropertySource> {
		return new SourcesIterator(this.sources[Symbol.iterator](), (source) => this.adapt(source))
  }
  private sources: Iterable<PropertySource<Object>>
	private cache = new Map<PropertySource<Object>, ConfigurationPropertySource>()

  constructor(sources: Iterable<PropertySource<Object>>) {
		this.sources = sources
	}

  private adapt(source: PropertySource<Object>): ConfigurationPropertySource {
		let result = this.cache.get(source)
		// Most PropertySources test equality only using the source name, so we need to
		// check the actual source hasn't also changed.
		if (result != null && result.getUnderlyingSource() == source) {
			return result
		}
		result = SpringConfigurationPropertySource.from(source)
		this.cache.set(source, result)
		return result
	}

}
