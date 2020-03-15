import { ConditionalGenericConverter, ConversionService, GenericConverter, TypeDescriptor } from '@tspring/core'

export class CollectionToDelimitedStringConverter implements ConditionalGenericConverter {
  private conversionService: any

  constructor(conversionService: ConversionService) {
		this.conversionService = conversionService
  }

  getConvertibleTypes(): Set<GenericConverter.ConvertiblePair> {
    throw new Error('Method not implemented.')
  }

  convert(source: Object | undefined, sourceType: TypeDescriptor, targetType: TypeDescriptor): Object | undefined {
    throw new Error('Method not implemented.')
  }

  matches(sourceType: TypeDescriptor, targetType: TypeDescriptor): boolean {
    throw new Error('Method not implemented.')
  }

}
