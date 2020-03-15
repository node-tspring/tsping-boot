import { FilteringSpringBootCondition } from './FilteringSpringBootCondition'
import { ConfigurationCondition } from '@tspring/context'
import { Implements } from '@tspring/core'

@Implements(ConfigurationCondition)
export class OnBeanCondition extends FilteringSpringBootCondition implements ConfigurationCondition {

  getConfigurationPhase(): ConfigurationCondition.ConfigurationPhase {
    return ConfigurationCondition.ConfigurationPhase.PARSE_CONFIGURATION
  }
}
