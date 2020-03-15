import { isImplements, Class, Interface } from '@tspring/core'
import { OriginProvider } from './OriginProvider'

export interface Origin {

}

export const Origin = new (class extends Interface{
  from (source: any): Origin | undefined {
    if (isImplements<Origin>(source, Origin)) {
      return source
    }
    let origin: Origin | undefined
    if (isImplements<OriginProvider>(source, Class.require<typeof OriginProvider>('@tspring/boot:OriginProvider'))) {
      origin = source.getOrigin()
    }
    if (origin == undefined && source instanceof Error) {
      return this.from ((source as any).cause)
    }
    return origin
  }
})('Origin')
