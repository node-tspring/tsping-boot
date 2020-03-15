import { SpringBootCondition } from './SpringBootCondition'
import { Implements } from '@tspring/core'
import { BeanFactoryAware, BeanFactory } from '@tspring/beans'
import { AutoConfigurationImportFilter } from '../AutoConfigurationImportFilter'
import { AutoConfigurationMetadata } from '../AutoConfigurationMetadata'

@Implements(AutoConfigurationImportFilter, BeanFactoryAware)
export abstract class FilteringSpringBootCondition extends SpringBootCondition implements AutoConfigurationImportFilter, BeanFactoryAware {
  private beanFactory?: BeanFactory

  setBeanFactory(beanFactory: BeanFactory): void {
    this.beanFactory = beanFactory
  }

  match(autoConfigurationClasses: string[], autoConfigurationMetadata: AutoConfigurationMetadata): boolean[] {
    return []
  }

}
