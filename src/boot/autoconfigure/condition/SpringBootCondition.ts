import { Condition, ConditionContext } from '@tspring/context'
import { Implements, AnnotatedTypeMetadata } from '@tspring/core'

@Implements(Condition)
export abstract class SpringBootCondition implements Condition {
  matches(context: ConditionContext, metadata: AnnotatedTypeMetadata): boolean {
    return true
  }
}
