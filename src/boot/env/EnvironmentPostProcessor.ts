import { SpringApplication } from '../SpringApplication'
import { ConfigurableEnvironment, Interface } from '@tspring/core'

export interface EnvironmentPostProcessor {

	postProcessEnvironment(environment: ConfigurableEnvironment, application: SpringApplication): void

}

export const EnvironmentPostProcessor = new Interface('EnvironmentPostProcessor')
