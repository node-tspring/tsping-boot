import { SpringApplicationRunListener } from '../../SpringApplicationRunListener'
import { Ordered, Implements, ConfigurableEnvironment } from '@tspring/core'
import { ConfigurableApplicationContext, SimpleApplicationEventMulticaster } from '@tspring/context'
import { SpringApplication } from '../../SpringApplication'
import { ApplicationEnvironmentPreparedEvent } from './ApplicationEnvironmentPreparedEvent'

@Implements(SpringApplicationRunListener, Ordered)
export class EventPublishingRunListener implements SpringApplicationRunListener, Ordered {
	private initialMulticaster: SimpleApplicationEventMulticaster
  private application: SpringApplication
  private args: string[]

  constructor(application: SpringApplication, args: string[]) {
    this.application = application
		this.args = args
		this.initialMulticaster = new SimpleApplicationEventMulticaster()
		for (const listener of application.getListeners()) {
			this.initialMulticaster.addApplicationListener(listener)
		}
  }

  getOrder(): number {
    return 0
  }

  starting(): void {
  }

  environmentPrepared(environment: ConfigurableEnvironment): void {
    this.initialMulticaster.multicastEvent(new ApplicationEnvironmentPreparedEvent(this.application, this.args, environment))
  }

  contextPrepared(context: ConfigurableApplicationContext): void {
  }

  contextLoaded(context: ConfigurableApplicationContext): void {
  }

  started(context: ConfigurableApplicationContext): void {
  }

  running(context: ConfigurableApplicationContext): void {
  }

  failed(context: ConfigurableApplicationContext, exception: Error): void {
  }

}
