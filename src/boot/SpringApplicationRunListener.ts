import { ConfigurableApplicationContext } from '@tspring/context'
import { Environment, Interface } from '@tspring/core'

export interface SpringApplicationRunListener {
	starting(): void
	environmentPrepared(environment: Environment): void
	contextPrepared(context: ConfigurableApplicationContext): void
	contextLoaded(context: ConfigurableApplicationContext): void
	started(context: ConfigurableApplicationContext): void
	running(context: ConfigurableApplicationContext): void
	failed(context: ConfigurableApplicationContext, exception: Error): void
}

export const SpringApplicationRunListener = new Interface('SpringApplicationRunListener')
