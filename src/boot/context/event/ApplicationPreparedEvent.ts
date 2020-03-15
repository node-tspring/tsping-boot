import { SpringApplicationEvent } from './SpringApplicationEvent'
import { SpringApplication } from '../../SpringApplication'
import { ConfigurableApplicationContext } from '@tspring/context'

export class ApplicationPreparedEvent extends SpringApplicationEvent {
  private context: ConfigurableApplicationContext

  constructor(application: SpringApplication, args: string[], context: ConfigurableApplicationContext) {
    super(application, args)
    this.context = context
  }

  getApplicationContext() {
		return this.context
	}
}
