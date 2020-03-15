import { SpringApplicationEvent } from './SpringApplicationEvent'
import { ConfigurableEnvironment } from '@tspring/core'
import { SpringApplication } from '../../SpringApplication'

export class ApplicationEnvironmentPreparedEvent extends SpringApplicationEvent {
  private environment: ConfigurableEnvironment

  constructor(application: SpringApplication, args: string[], environment: ConfigurableEnvironment) {
    super(application, args)
    this.environment = environment
  }

  getEnvironment() {
		return this.environment
	}
}
