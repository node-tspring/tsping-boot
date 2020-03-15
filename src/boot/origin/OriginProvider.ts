import { Origin } from './Origin'
import { Interface } from '@tspring/core'

export interface OriginProvider {
	getOrigin(): Origin
}

export const OriginProvider = new Interface('OriginProvider')
