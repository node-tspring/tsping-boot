import { Annotation, ElementType } from '@tspring/core'
import { Import } from '@tspring/context'
import { AutoConfigurationPackages } from './AutoConfigurationPackages'

export type AnnotationParams = {} & Annotation.Params<undefined>

export const AutoConfigurationPackage = Annotation.define<ElementType.TYPE, undefined, AnnotationParams>({
  name: 'AutoConfigurationPackage',
  extends: [Import(AutoConfigurationPackages.Registrar)]
})

export module AutoConfigurationPackage {
  export type Params = AnnotationParams
}
