import { AnnotationMetadata, CollectionUtils, Class } from '@tspring/core'
import { BeanDefinitionRegistry } from '@tspring/beans'

class PackageImport {

  private packageName: string

  constructor(metadata: AnnotationMetadata) {
    this.packageName = Class.getPackageName(metadata.getClass())
  }

  getPackageName() {
    return this.packageName
  }

  equals(obj: Object) {
    if (obj == undefined || this.constructor != obj.constructor) {
      return false
    }
    return this.packageName == (obj as PackageImport).packageName
  }

  toString() {
    return `Package Import ${this.packageName}`
  }

}

export abstract class AutoConfigurationPackages {
  static register(registry: BeanDefinitionRegistry, ...packageNames: string[]): void {
		// if (registry.containsBeanDefinition(BEAN)) {
		// 	BeanDefinition beanDefinition = registry.getBeanDefinition(BEAN)
		// 	ConstructorArgumentValues constructorArguments = beanDefinition.getConstructorArgumentValues()
		// 	constructorArguments.addIndexedArgumentValue(0, addBasePackages(constructorArguments, packageNames))
		// }
		// else {
		// 	GenericBeanDefinition beanDefinition = new GenericBeanDefinition()
		// 	beanDefinition.setBeanClass(BasePackages.class)
		// 	beanDefinition.getConstructorArgumentValues().addIndexedArgumentValue(0, packageNames)
		// 	beanDefinition.setRole(BeanDefinition.ROLE_INFRASTRUCTURE)
		// 	registry.registerBeanDefinition(BEAN, beanDefinition)
		// }
	}
}

export module AutoConfigurationPackages {
  export class Registrar /* implements ImportBeanDefinitionRegistrar, DeterminableImports */ {

		registerBeanDefinitions(metadata: AnnotationMetadata, registry: BeanDefinitionRegistry ) {
			AutoConfigurationPackages.register(registry, new PackageImport(metadata).getPackageName())
		}

		determineImports(metadata: AnnotationMetadata): Set<Object> {
			return CollectionUtils.singleton(new PackageImport(metadata))
		}

	}
}
