import { Annotation, ElementType, Class } from '@tspring/core'
import { Import } from '@tspring/context'
import { EnableConfigurationPropertiesRegistrar } from './EnableConfigurationPropertiesRegistrar'

export type AnnotationParams = {} & Annotation.Params<Class<Object> | Class<Object>[]>

export const VALIDATOR_BEAN_NAME = 'configurationPropertiesValidator'

export const EnableConfigurationProperties = Annotation.define<ElementType.TYPE, Class<Object> | Class<Object>[], AnnotationParams>({
  name: 'EnableConfigurationProperties',
  attributes: {
    value: {
      default: []
    }
  },
  extends: [Import(EnableConfigurationPropertiesRegistrar)]
})

export module EnableConfigurationProperties {
  export type Params = AnnotationParams
}
