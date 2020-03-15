import { Annotation, ElementType } from '@tspring/core'
import { Configuration } from '@tspring/context'

export type AnnotationParams = {
  proxyBeanMethods: boolean
} & Annotation.Params<undefined>

export const SpringBootConfiguration = Annotation.define<ElementType.TYPE, undefined, AnnotationParams>({
  name: 'SpringBootConfiguration',
  attributes: {
    proxyBeanMethods: {
      aliasFor: { annotation: Configuration },
      default: true
    }
  },
  extends: [Configuration]
})

export module SpringBootConfiguration {
  export type Params = AnnotationParams
}
