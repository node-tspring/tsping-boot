import { ApplicationEvent } from '@tspring/context'
import { SpringApplication } from '../../SpringApplication'

export abstract class SpringApplicationEvent extends ApplicationEvent {
  private args: string[]

  constructor(application: SpringApplication, args: string[]) {
		super(application)
		this.args = args
	}

	getSpringApplication() {
		return this.getSource() as SpringApplication
	}
}
