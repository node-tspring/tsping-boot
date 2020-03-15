import { ConditionalGenericConverter, Implements, TypeDescriptor, GenericConverter, ConversionService, CollectionUtils, PrimitiveType, GenericType } from '@tspring/core'
import { CollectionToDelimitedStringConverter } from './CollectionToDelimitedStringConverter'

type ConvertiblePair = GenericConverter.ConvertiblePair

@Implements(ConditionalGenericConverter)
export class ArrayToDelimitedStringConverter implements ConditionalGenericConverter {
	private delegate: CollectionToDelimitedStringConverter

  constructor(conversionService: ConversionService) {
		this.delegate = new CollectionToDelimitedStringConverter(conversionService)
  }

  getConvertibleTypes(): Set<ConvertiblePair> {
		return CollectionUtils.singleton(new GenericConverter.ConvertiblePair(GenericType.ObjectArray, PrimitiveType.string))
  }

  convert(source: Object | undefined, sourceType: TypeDescriptor, targetType: TypeDescriptor): Object | undefined {
    const list = CollectionUtils.toArray(source)
		return this.delegate.convert(list, sourceType, targetType)
  }

  matches(sourceType: TypeDescriptor, targetType: TypeDescriptor): boolean {
		return this.delegate.matches(sourceType, targetType)
  }
}
