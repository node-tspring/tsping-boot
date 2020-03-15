import { ConfigurationPropertySource } from '../source/ConfigurationPropertySource'
import { PlaceholdersResolver } from './PlaceholdersResolver'
import { ConversionService, Consumer, StringUtils, Implements } from '@tspring/core'
import { PropertyEditorRegistry } from '@tspring/beans'
import { BindHandler } from './BindHandler'
import { ApplicationConversionService } from '../../../../convert/ApplicationConversionService'
import { Bindable } from './Bindable'
import { BindResult } from './BindResult'
import { ConfigurationProperty } from '../source/ConfigurationProperty'
import { BindContext } from './BindContext'
import { BindConverter } from './BindConverter'
import { DataObjectBinder } from './DataObjectBinder'
import { AggregateBinder } from './AggregateBinder'
import { DefaultBindHandler } from './DefaultBindHandler'

export interface Context extends BindContext {
  depth: number
  clearConfigurationProperty(): void
  getConverter(): BindConverter
  setConfigurationProperty(configurationProperty: ConfigurationProperty): void
}

const DATA_OBJECT_BINDERS: DataObjectBinder[] = [ /* new ValueObjectBinder(), new JavaBeanBinder() */ ]
const DEFAULT_BIND_HANDLER = new DefaultBindHandler()

export class Binder {
  private sources: Iterable<ConfigurationPropertySource>
  private placeholdersResolver: PlaceholdersResolver
  private conversionService: ConversionService
  private propertyEditorInitializer: Consumer<PropertyEditorRegistry> | undefined
  private defaultBindHandler: BindHandler

  constructor(
    sources: Iterable<ConfigurationPropertySource>,
    placeholdersResolver: PlaceholdersResolver,
    conversionService?: ConversionService,
    propertyEditorInitializer?: Consumer<PropertyEditorRegistry>,
    defaultBindHandler?: BindHandler) {
      this.sources = sources
      this.placeholdersResolver = placeholdersResolver != undefined
        ? placeholdersResolver
        : PlaceholdersResolver.NONE
      this.conversionService = conversionService != undefined
        ? conversionService
        : ApplicationConversionService.getSharedInstance()
      this.propertyEditorInitializer = propertyEditorInitializer
      this.defaultBindHandler = defaultBindHandler != undefined
        ? defaultBindHandler
        : DEFAULT_BIND_HANDLER
  }

	bind<T>(name: string, target: Bindable<T>, handler?: BindHandler): BindResult<T> {
    const bound = this.$bind(name, target, handler, false)
		return BindResult.of(bound)
  }

	private $bind<T>(name: string, target: Bindable<T>, handler: BindHandler | undefined, create: boolean): T | undefined {
    handler = (handler != undefined) ? handler : this.defaultBindHandler
    const context = new this.Context()
		return this.$$bind(name, target, handler, context, false, create)
  }

  private $$bind<T>(name: string, target: Bindable<T>, handler: BindHandler, context: Context, allowRecursiveBinding: boolean, create: boolean): T | undefined {
		context.clearConfigurationProperty()
    try {
			const replacementTarget = handler.onStart(name, target, context)
			if (replacementTarget == undefined) {
				return this.handleBindResult(name, target, handler, context, undefined, create)
			}
			target = replacementTarget
			const bound = this.bindObject(name, target, handler, context, allowRecursiveBinding)
			return this.handleBindResult(name, target, handler, context, bound, create)
		}
		catch (ex) {
			return this.handleBindError(name, target, handler, context, ex)
		}
  }

  private handleBindError<T>(name: string, target: Bindable<T>, handler: BindHandler, context: Context, error: Error) {
    try {
      const result = handler.onFailure(name, target, context, error)
      return context.getConverter().convert(result, target)
    }
    catch (ex) {
      // if (ex instanceof BindException) {
      //   throw ex
      // }
      // throw new BindException(name, target, context.getConfigurationProperty(), ex)
      throw ex
    }
  }

	private bindObject<T>(name: string , target: Bindable<T>, handler: BindHandler, context: Context, allowRecursiveBinding: boolean): T | undefined {
		const property = this.findProperty(name, context)
    if (property == undefined && this.containsNoDescendantOf(context.getSources(), name) && context.depth != 0) {
			return undefined
    }

		const aggregateBinder = this.getAggregateBinder(target, context)
    if (aggregateBinder != undefined) {
			return this.bindAggregate(name, target, handler, context, aggregateBinder)
		}

    if (property != undefined) {
			try {
				return this.bindProperty(target, context, property)
			}
			catch (ex) {
        // ConverterNotFoundException
				// We might still be able to bind it using the recursive binders
				const instance = this.bindDataObject(name, target, handler, context, allowRecursiveBinding)
				if (instance != undefined) {
					return instance
				}
				throw ex
			}
		}
		return this.bindDataObject(name, target, handler, context, allowRecursiveBinding)
  }

  private bindProperty<T>(target: Bindable<T>, context: Context, property: ConfigurationProperty): T | undefined {
		context.setConfigurationProperty(property)
		let result: Object | undefined = property.getValue()
		result = this.placeholdersResolver.resolvePlaceholders(result)
		return context.getConverter().convert(result, target)
	}

	private bindDataObject<T>(name: string, target: Bindable<T>, handler: BindHandler, context: Context, allowRecursiveBinding: boolean): T | undefined {
    return undefined
  }

  private bindAggregate<T>(name: string, target: Bindable<T>, handler: BindHandler, context: Context, aggregateBinder: AggregateBinder<Object>): T | undefined {
    // const elementBinder = (itemName: string, itemTarget: Bindable<T>, source: ConfigurationPropertySource) => {
    //   const allowRecursiveBinding = aggregateBinder.isAllowRecursiveBinding(source)
    //   const supplier: Supplier<T | undefined> = { get: () => this.$$bind(itemName, itemTarget, handler, context, allowRecursiveBinding, false) }
    //   return context.withSource(source, supplier)
    // }
    // return context.withIncreasedDepth(() => aggregateBinder.bind(name, target, elementBinder))
    return undefined
  }

  private getAggregateBinder(target: Bindable<Object>, context: Context): AggregateBinder<Object> | undefined {
    const type = target.getType()
    // if (type instanceof GenericType) {
    //   const resolvedType = type.getBoxedType()
    //   if (resolvedType instanceof GenericType) {
    //     if (resolvedType.getType().prototype instanceof Map) {
    //       return new MapBinder(context)
    //     }
    //     if (resolvedType.getType().prototype instanceof Set) {
    //       return new SetBinder(context)
    //     }
    //     if (resolvedType.getType().prototype instanceof Array) {
    //       return new ArrayBinder(context)
    //     }
    //   }
    // }
		return undefined
	}

  private containsNoDescendantOf(sources: Iterable<ConfigurationPropertySource> , name: string) {
    // for (const source of sources) {
    //   if (source.containsDescendantOf(name) != ConfigurationPropertyState.ABSENT) {
    //     return false
    //   }
    // }
    // return true
    return false
  }

  private handleBindResult<T>(name: string, target: Bindable<T>, handler: BindHandler, context: Context, result: Object | undefined, create: boolean): T | undefined {
    if (result != undefined) {
      result = handler.onSuccess(name, target, context, result)
      result = context.getConverter().convert(result, target)
    }
    if (result == undefined && create) {
      result = this.create(target, context)
      result = handler.onCreate(name, target, context, result)
      result = context.getConverter().convert(result, target)
      // Assert.state(result != null, () -> 'Unable to create instance for ' + target.getType())
    }
    handler.onFinish(name, target, context, result)
    return context.getConverter().convert(result, target)
  }

  private create(target: Bindable<Object>, context: Context) {
		for (const dataObjectBinder of DATA_OBJECT_BINDERS) {
			const instance = dataObjectBinder.create(target, context)
			if (instance != undefined) {
				return instance
			}
		}
		return undefined
	}

  private findProperty(name: string, context: BindContext): ConfigurationProperty | undefined {
		if (!StringUtils.hasText(name)) {
			return undefined
		}
		for (const source of context.getSources()) {
			const property = source.getConfigurationProperty(name)
			if (property != undefined) {
				return property
			}
		}
		return undefined
  }

	private readonly Context = ((outerThis) => {
    @Implements(BindContext)
    class Context implements BindContext {
      depth = 0
		  private sourcePushCount = 0
      private source: Iterable<ConfigurationPropertySource> = [undefined as any]
		  private configurationProperty?: ConfigurationProperty
      private converter: BindConverter

      constructor() {
			  this.converter = BindConverter.get(outerThis.conversionService, outerThis.propertyEditorInitializer)
      }

      setConfigurationProperty(configurationProperty: ConfigurationProperty): void {
        this.configurationProperty = configurationProperty
      }

      clearConfigurationProperty() {

      }

      getBinder(): Binder {
			  return outerThis
      }

      getDepth(): number {
			  return this.depth
      }

      getSources(): Iterable<ConfigurationPropertySource> {
        if (this.sourcePushCount > 0) {
          return this.source
        }
        return outerThis.sources
      }

      getConfigurationProperty(): ConfigurationProperty | undefined {
			  return this.configurationProperty
      }

      getConverter() {
        return this.converter
      }
    }
    return Context
  })(this)

}
