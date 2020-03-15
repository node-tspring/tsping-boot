import { ConditionalGenericConverter, Implements, ConversionService, GenericConverter, PrimitiveType, CollectionUtils, GenericType, TypeDescriptor } from '@tspring/core'

type ConvertiblePair = GenericConverter.ConvertiblePair

@Implements(ConditionalGenericConverter)
export class DelimitedStringToArrayConverter implements ConditionalGenericConverter {
  private conversionService: ConversionService

  constructor(conversionService: ConversionService) {
		this.conversionService = conversionService
  }

  getConvertibleTypes(): Set<ConvertiblePair> {
		return CollectionUtils.singleton(new GenericConverter.ConvertiblePair(PrimitiveType.string, GenericType.StringArray))
  }

  convert(source: Object | undefined, sourceType: TypeDescriptor, targetType: TypeDescriptor): Object | undefined {
    if (source == undefined) {
			return undefined
		}
		return this.$convert(source as string, sourceType, targetType)
  }

  private $convert(source: string, sourceType: TypeDescriptor, targetType: TypeDescriptor): Object {
		const delimiter: any = undefined // targetType.getAnnotation(Delimiter)
		const elements = this.getElements(source, (delimiter != undefined) ? delimiter.value : ',')
		const elementDescriptor = targetType.getElementTypeDescriptor()
		const target = []
		for (let i = 0; i < elements.length; i++) {
			const sourceElement = elements[i].trim()
      const targetElement = elementDescriptor == undefined
        ? sourceElement
        : this.conversionService.convert(sourceElement, elementDescriptor)
			target[i] = targetElement
		}
		return target
  }

  private getElements(source: string, delimiter: string): string[] {
		return source.trim().split(delimiter)
	}

  matches(sourceType: TypeDescriptor, targetType: TypeDescriptor): boolean {
    return targetType.getElementTypeDescriptor() == undefined
				|| this.conversionService.canConvert(sourceType, targetType.getElementTypeDescriptor()!)
  }
}
