import { SpringApplicationRunListener } from './SpringApplicationRunListener'
import { ConfigurableApplicationContext } from '@tspring/context'
import { Environment } from '@tspring/core'

export class SpringApplicationRunListeners {
	private listeners: SpringApplicationRunListener[]

	constructor(listeners: SpringApplicationRunListener[]) {
		this.listeners = listeners
	}

	starting () {
		for (const listener of this.listeners) {
			listener.starting()
		}
	}

	environmentPrepared(environment: Environment) {
    for (const listener of this.listeners) {
			listener.environmentPrepared(environment)
		}
	}

	contextPrepared(context: ConfigurableApplicationContext) {
    for (const listener of this.listeners) {
			listener.contextPrepared(context)
		}
	}

	contextLoaded(context: ConfigurableApplicationContext) {
    for (const listener of this.listeners) {
      listener.contextLoaded(context)
		}
	}

	started(context: ConfigurableApplicationContext) {
    for (const listener of this.listeners) {
      listener.started(context)
		}
	}

	running(context: ConfigurableApplicationContext) {
    for (const listener of this.listeners) {
      listener.running(context)
		}
	}

	failed(context: ConfigurableApplicationContext, exception: Error) {
    for (const listener of this.listeners) {
      this.callFailedListener(listener, context, exception)
		}
	}

	private callFailedListener(listener: SpringApplicationRunListener, context: ConfigurableApplicationContext, exception: Error) {
		try {
			listener.failed(context, exception)
		} catch (ex) {
			if (exception == undefined) {
        throw ex
			}
      let message = ex.message
      message = (message != undefined) ? message : 'no error message'
      console.warn(`Error handling failed (${message})`)
		}
	}
}
