import { ConversionService, Consumer, Class, TypeDescriptor, GenericConversionService, ConditionalGenericConverter, Implements, CollectionUtils, GenericConverter, PrimitiveType } from '@tspring/core'
import { PropertyEditorRegistry, SimpleTypeConverter } from '@tspring/beans'
import { ApplicationConversionService } from '../../../../convert/ApplicationConversionService'
import { Bindable } from './Bindable'
import { TypeDef } from '@tspring/core'

type ConvertiblePair = GenericConverter.ConvertiblePair
const ConvertiblePair = GenericConverter.ConvertiblePair

class CompositeConversionService implements ConversionService {
  constructor(private delegates: ConversionService[]) {}

  canConvert(sourceType: TypeDef, targetType: TypeDef): boolean
  canConvert(sourceType: TypeDescriptor, targetType: TypeDescriptor): boolean
  canConvert(sourceType: TypeDef | TypeDescriptor, targetType: TypeDef | TypeDescriptor): boolean {
    if (sourceType instanceof TypeDescriptor) {
      sourceType = sourceType.getType()
    }
    if (targetType instanceof TypeDescriptor) {
      targetType = targetType.getType()
    }
    for (const service of this.delegates) {
      if (service.canConvert(sourceType, targetType)) {
        return true
      }
    }
    return false
  }

  convert<T>(source: Object, targetType: Class<T>): T
  convert(source: Object, targetType: TypeDescriptor): Object
  convert<T>(source: Object, targetType: Class<T> | TypeDescriptor): T {
    if (targetType instanceof TypeDescriptor) {
      targetType = targetType.getType() as Class<T>
    }
    const sourceType = TypeDescriptor.fromObject(source).getType()
    for (let i = 0; i < this.delegates.length - 1; i++) {
      try {
        const delegate = this.delegates[i]
        if (delegate.canConvert(sourceType, targetType)) {
          return delegate.convert(source, targetType)
        }
      }
      catch (ex) {
      }
    }
    return this.delegates[this.delegates.length - 1].convert(source, targetType)
  }
}

@Implements(ConditionalGenericConverter)
class TypeConverterConverter implements ConditionalGenericConverter {

  private typeConverter: SimpleTypeConverter

  constructor(typeConverter: SimpleTypeConverter) {
    this.typeConverter = typeConverter
  }

  getConvertibleTypes(): Set<ConvertiblePair> {
    return CollectionUtils.singleton(new ConvertiblePair(PrimitiveType.string, Object))
  }

  matches(sourceType: TypeDescriptor, targetType: TypeDescriptor): boolean {
    // return this.getPropertyEditor(targetType.getType()) != undefined
    return false
  }

  convert(source: Object, sourceType: TypeDescriptor, targetType: TypeDescriptor): Object {
    const typeConverter = this.typeConverter
    return typeConverter.convertIfNecessary(source, targetType.getType())
  }

  // private getPropertyEditor(type: Class<Object>): PropertyEditor {
  //   if (type == undefined || type == Object || ClassUtils.isAssignableFrom(Array, type) || ClassUtils.isAssignableFrom(Map, type)) {
  //     return undefined
  //   }
  //   const typeConverter = this.typeConverter
  //   let editor = typeConverter.getDefaultEditor(type)
  //   if (editor == undefined) {
  //     editor = typeConverter.findCustomEditor(type, undefined)
  //   }
  //   if (editor == undefined && string != type) {
  //     editor = BeanUtils.findEditorByConvention(type)
  //   }
  //   if (editor == undefined || EXCLUDED_EDITORS.contains(editor.getClass())) {
  //     return undefined
  //   }
  //   return editor
  // }

}

class TypeConverterConversionService extends GenericConversionService {

  constructor(initializer: Consumer<PropertyEditorRegistry> | undefined) {
    super()
    this.addConverter(new TypeConverterConverter(this.createTypeConverter(initializer)))
    ApplicationConversionService.addDelimitedStringConverters(this)
  }

  private createTypeConverter(initializer: Consumer<PropertyEditorRegistry> | undefined): SimpleTypeConverter {
    const typeConverter = new SimpleTypeConverter()
    if (initializer != undefined) {
      initializer.accept(typeConverter)
    }
    return typeConverter
  }

}

export class BindConverter {
  private static sharedInstance: BindConverter
  private conversionService: CompositeConversionService

  private constructor(conversionService: ConversionService, propertyEditorInitializer: Consumer<PropertyEditorRegistry> | undefined) {
    const conversionServices = this.getConversionServices(conversionService, propertyEditorInitializer)
    this.conversionService = new CompositeConversionService(conversionServices)
  }

  convert<T>(result: Object | undefined, target: Bindable<T>): T | undefined {
    try {
      return this.$convert<T>(result, target.getType())
    } catch (ex) {
      return undefined
    }
  }

  $convert<T>(value: Object | undefined, type: Class<T>): T | undefined {
		if (value == undefined) {
			return undefined
		}
		return this.conversionService.convert(value, type)
	}

  private getConversionServices(conversionService: ConversionService, propertyEditorInitializer: Consumer<PropertyEditorRegistry> | undefined): ConversionService[] {
    const services: ConversionService[] = []
    services.push(new TypeConverterConversionService(propertyEditorInitializer))
    services.push(conversionService)
    if (!(conversionService instanceof ApplicationConversionService)) {
      services.push(ApplicationConversionService.getSharedInstance())
    }
    return services
  }

  static get(conversionService: ConversionService, propertyEditorInitializer: Consumer<PropertyEditorRegistry> | undefined): BindConverter {
    if (conversionService == ApplicationConversionService.getSharedInstance() && propertyEditorInitializer == undefined) {
      if (BindConverter.sharedInstance == undefined) {
        BindConverter.sharedInstance = new BindConverter(conversionService, propertyEditorInitializer)
      }
      return BindConverter.sharedInstance
    }
    return new BindConverter(conversionService, propertyEditorInitializer)
  }
}
