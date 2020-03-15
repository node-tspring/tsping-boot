import { Comparable, Implements } from '@tspring/core'
import { OriginProvider } from '../../../../origin/OriginProvider'
import { Origin } from '../../../../origin/Origin'

@Implements(OriginProvider, Comparable)
export class ConfigurationProperty implements OriginProvider, Comparable<ConfigurationProperty> {

  constructor(private name: string, private value: Object, private origin: Origin ) {
  }

  compareTo(o: ConfigurationProperty): number {
    throw new Error('Method not implemented.')
  }

  getOrigin(): Origin {
    throw new Error('Method not implemented.')
  }

  getValue(): Object {
		return this.value
  }

  static of(name: string, value: Object, origin: Origin) {
		if (value == undefined) {
			return undefined
		}
		return new ConfigurationProperty(name, value, origin)
	}
}
