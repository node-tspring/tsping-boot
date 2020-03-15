import { ConfigurationPropertySource } from './ConfigurationPropertySource'
import { Interface } from '@tspring/core'

export interface IterableConfigurationPropertySource extends ConfigurationPropertySource, Iterable<string> {

}

export const IterableConfigurationPropertySource = new Interface(
  'IterableConfigurationPropertySource',
  [ConfigurationPropertySource]
)
