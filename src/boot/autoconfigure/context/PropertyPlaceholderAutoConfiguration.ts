import { Configuration, Bean, PropertySourcesPlaceholderConfigurer } from '@tspring/context'
import { ConditionalOnMissingBean } from '../condition/ConditionalOnMissingBean'
import { SearchStrategy } from '../condition/SearchStrategy'
import { Ordered } from '@tspring/core'
import { AutoConfigureOrder } from '../AutoConfigureOrder'

@Configuration
@AutoConfigureOrder(Ordered.HIGHEST_PRECEDENCE)
export class PropertyPlaceholderAutoConfiguration {

	@Bean
	@ConditionalOnMissingBean({ search: SearchStrategy.CURRENT })
	static propertySourcesPlaceholderConfigurer(): PropertySourcesPlaceholderConfigurer  {
		return new PropertySourcesPlaceholderConfigurer()
	}

}
