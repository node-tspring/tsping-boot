import { Annotation, ElementType, Class } from '@tspring/core'
import { ComponentScan, Import, Configuration } from '@tspring/context'
import { PropertyPlaceholderAutoConfiguration } from './context/PropertyPlaceholderAutoConfiguration'
import { SpringBootConfiguration } from '../SpringBootConfiguration'
import { EnableAutoConfiguration } from './EnableAutoConfiguration'
import { ConfigurationPropertiesScan } from './context/properties/ConfigurationPropertiesScan'

type AnnotationParams = {
  exclude: Class<Object> | Class<Object>[]
  excludeName: string | string[]
  scanBasePackages: string | string[]
  scanBasePackageClasses: Class<Object> | Class<Object>[]
  proxyBeanMethods: boolean
} & Annotation.Params<undefined>

export const SpringBootApplication = Annotation.define<ElementType.TYPE, undefined, AnnotationParams>({
  name: 'SpringBootApplication',
  attributes: {
    exclude: {
      aliasFor: { annotation: EnableAutoConfiguration },
      default: []
    },
    excludeName: {
      aliasFor: { annotation: EnableAutoConfiguration },
      default: []
    },
    scanBasePackages: {
      aliasFor: {
        annotation: ComponentScan,
        attribute: 'basePackages'
      },
      default: []
    },
    scanBasePackageClasses: {
      aliasFor: {
        annotation: ComponentScan,
        attribute: 'basePackageClasses'
      },
      default: []
    },
    proxyBeanMethods: {
      aliasFor: {
        annotation: Configuration
      },
      default: true
    }
  },
  extends: [
    SpringBootConfiguration,
    EnableAutoConfiguration,
    ComponentScan({
      basePackages: [],
      basePackageClasses: []
    }),
    ConfigurationPropertiesScan,
    Import(
      PropertyPlaceholderAutoConfiguration
    )
  ]
})

export module SpringBootApplication {
  export type Params = AnnotationParams
}
