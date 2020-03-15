import { Annotation, ElementType, Class } from '@tspring/core'
import { Import } from '@tspring/context'
import { AutoConfigurationPackage } from './AutoConfigurationPackage'
import { AutoConfigurationImportSelector } from './AutoConfigurationImportSelector'

export type AnnotationParams = {
  exclude: Class<Object> | Class<Object>[]
  excludeName: string | string[]
} & Annotation.Params<undefined>

export const ENABLED_OVERRIDE_PROPERTY = 'spring.boot.enableautoconfiguration'

export const EnableAutoConfiguration = Annotation.define<ElementType.TYPE, undefined, AnnotationParams>({
  name: 'EnableAutoConfiguration',
  attributes: {
    exclude: {
      default: []
    },
    excludeName: {
      default: []
    }
  },
  extends: [
    AutoConfigurationPackage,
    Import(AutoConfigurationImportSelector)
  ]
})

export module EnableAutoConfiguration {
  export type Params = AnnotationParams
}
