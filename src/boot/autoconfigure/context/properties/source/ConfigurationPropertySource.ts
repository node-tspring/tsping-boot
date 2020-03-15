import { ConfigurationProperty } from './ConfigurationProperty'
import { Interface } from '@tspring/core'

export interface ConfigurationPropertySource {
  getConfigurationProperty(name: string): ConfigurationProperty | undefined
  getUnderlyingSource(): Object
}

export const ConfigurationPropertySource = new Interface('ConfigurationPropertySource')
