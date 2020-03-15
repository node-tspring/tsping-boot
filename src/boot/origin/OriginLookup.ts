import { isImplements, Interface } from '@tspring/core'
import { Origin } from './Origin'

export interface OriginLookup<K> {
	getOrigin(key: K): Origin | undefined
}

export const OriginLookup = new (class extends Interface{
	getOrigin<K>(source: Object, key: K) {
		if (!isImplements<OriginLookup<K>>(source, OriginLookup)) {
			return undefined
		}
		try {
			return source.getOrigin(key)
		}
		catch (ex) {
			return undefined
		}
	}
})('OriginLookup')
