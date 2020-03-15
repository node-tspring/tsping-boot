import { Annotation, ElementType, Class } from '@tspring/core'
import { Conditional } from '@tspring/context'
import { OnBeanCondition } from './OnBeanCondition'
import { SearchStrategy } from './SearchStrategy'

type AnnotationParams = {
  type?: string[]
  ignored?: Class<Object> | Class<Object>[]
  ignoredType?: string[]
  annotation?: Annotation | Annotation[]
  name?: string[]
  search?: SearchStrategy
  parameterizedContainer?: Class<Object> | Class<Object>[]
} & Annotation.Params<Class<Object> | Class<Object>[]>

export const ConditionalOnMissingBean = Annotation.define<ElementType.TYPE & ElementType.METHOD, Class<Object> | Class<Object>[], AnnotationParams>({
  name: 'ConditionalOnMissingBean',
  attributes: {
    type: {
      default: []
    },
    ignored: {
      default: []
    },
    ignoredType: {
      default: []
    },
    annotation: {
      default: []
    },
    name: {
      default: []
    },
    search: {
      default: SearchStrategy.ALL
    }
  },
  extends: [
    Conditional(OnBeanCondition)
  ]
})

export module ConditionalOnMissingBean {
  export type Params = AnnotationParams
}
