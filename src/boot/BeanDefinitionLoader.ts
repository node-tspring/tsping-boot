import { BeanDefinitionRegistry, BeanNameGenerator } from '@tspring/beans'
import { ResourceLoader, Environment, Class, IllegalArgumentException, Resource, isImplements, StandardAnnotationMetadata } from '@tspring/core'
import { Component, AnnotatedBeanDefinitionReader } from '@tspring/context'

export class BeanDefinitionLoader {

  private environment?: Environment
  private resourceLoader?: ResourceLoader
  private sources: Object[]
	private annotatedReader: AnnotatedBeanDefinitionReader

  constructor(registry: BeanDefinitionRegistry, ...sources: Object[]) {
		this.sources = sources
		this.annotatedReader = new AnnotatedBeanDefinitionReader(registry)
		// this.xmlReader = new XmlBeanDefinitionReader(registry)
		// this.scanner = new ClassPathBeanDefinitionScanner(registry)
		// this.scanner.addExcludeFilter(new ClassExcludeFilter(sources))
  }

  setEnvironment(environment: Environment) {
    this.environment = environment
  }

  setResourceLoader(resourceLoader: ResourceLoader) {
    this.resourceLoader = resourceLoader
  }

  setBeanNameGenerator(beanNameGenerator: BeanNameGenerator) {

  }

  load() {
    let count = 0
		for (const source of this.sources) {
			count += this.$load(source)
		}
		return count
  }

  private isComponent(type: Class<Object>) {
		return new StandardAnnotationMetadata(type).isAnnotated(Component)
	}

	private $load(source: Object): number {
    if (Class.isClass(source)) {
      if (this.isComponent(source)) {
        this.annotatedReader.register(source)
        return 1
      }
      return 0
    }

    else if (typeof source == 'string') {
      return 0
    }

    else if (isImplements<Resource>(source, Resource)) {
      return 0
    }

    throw new IllegalArgumentException('Invalid source type ' + source)
  }
}
