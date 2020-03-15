import { Annotation, ElementType } from '@tspring/core'

type AnnotationParams = {}

export const DEFAULT_ORDER = 0

export const AutoConfigureOrder = Annotation.define<ElementType.TYPE & ElementType.METHOD & ElementType.FIELD, undefined, AnnotationParams>({
  name: 'AutoConfigureOrder',
  attributes: {
    value: {
      default: DEFAULT_ORDER
    }
  }
})

export module AutoConfigureOrder {
  export type Params = AnnotationParams
}
