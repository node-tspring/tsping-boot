import { DeferredImportSelector, EnvironmentAware, ResourceLoaderAware } from '@tspring/context'
import { BeanFactoryAware, BeanFactory } from '@tspring/beans'
import { Ordered, ResourceLoader, AnnotationMetadata, Environment, Class, Implements } from '@tspring/core'

@Implements(DeferredImportSelector.Group, BeanFactoryAware, ResourceLoaderAware)
class AutoConfigurationGroup implements DeferredImportSelector.Group, BeanFactoryAware, ResourceLoaderAware {
  private beanFactory?: BeanFactory
  private resourceLoader?: ResourceLoader
  process(metadata: AnnotationMetadata, selector: DeferredImportSelector): void {

  }

  selectImports(): Iterable<DeferredImportSelector.Group.Entry> {
    return []
  }

  setBeanFactory(beanFactory: BeanFactory): void {
		this.beanFactory = beanFactory
  }

  setResourceLoader(resourceLoader: ResourceLoader): void {
		this.resourceLoader = resourceLoader
  }

}

@Implements(
  DeferredImportSelector,
  ResourceLoaderAware,
  BeanFactoryAware,
  EnvironmentAware,
  Ordered
)
export class AutoConfigurationImportSelector implements
  DeferredImportSelector,
  ResourceLoaderAware,
  BeanFactoryAware,
  EnvironmentAware,
  Ordered
{
  private environment?: Environment
  private beanFactory?: BeanFactory
  private resourceLoader?: ResourceLoader

  getImportGroup(): Class<DeferredImportSelector.Group> | undefined {
    return AutoConfigurationGroup
  }

  selectImports(importingClassMetadata: AnnotationMetadata): string[] {
    return []
  }

  setResourceLoader(resourceLoader: ResourceLoader): void {
		this.resourceLoader = resourceLoader
  }

  setBeanFactory(beanFactory: BeanFactory): void {
		this.beanFactory = beanFactory
  }

  setEnvironment(environment: Environment): void {
    this.environment = environment
  }

  getOrder(): number {
    return Ordered.LOWEST_PRECEDENCE - 1
  }

}
