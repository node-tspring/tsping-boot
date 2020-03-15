import { Annotation, ElementType, Class } from '@tspring/core'
import { Import } from '@tspring/context'
import { EnableConfigurationProperties } from './EnableConfigurationProperties'
import { ConfigurationPropertiesScanRegistrar } from './ConfigurationPropertiesScanRegistrar'

export type AnnotationParams = {
  basePackages: string | string[]
  basePackageClasses: Class<Object> | Class<Object>[]
} & Annotation.Params<string | string[]>

export const ConfigurationPropertiesScan = Annotation.define<ElementType.TYPE, string | string[], AnnotationParams>({
  name: 'ConfigurationPropertiesScan',
  attributes: {
    value: {
      aliasFor: 'basePackages',
      default: []
    },
    basePackages: {
      aliasFor: 'value',
      default: []
    },
	  basePackageClasses: {
      default: []
    }
  },
  extends: [
    Import(ConfigurationPropertiesScanRegistrar),
    EnableConfigurationProperties
  ]
})

export module ConfigurationPropertiesScan {
  export type Params = AnnotationParams
}
