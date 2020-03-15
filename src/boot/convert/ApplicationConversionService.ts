import { FormattingConversionService, FormatterRegistry } from '@tspring/context'
import { ConversionService, ConverterRegistry, StringValueResolver, DefaultConversionService } from '@tspring/core'
import { DelimitedStringToArrayConverter } from './DelimitedStringToArrayConverter'

export class ApplicationConversionService extends FormattingConversionService {
  static readonly sharedInstance = new ApplicationConversionService()

  constructor(embeddedValueResolver?: StringValueResolver) {
    super()
		if (embeddedValueResolver != undefined) {
			this.setEmbeddedValueResolver(embeddedValueResolver)
		}
		ApplicationConversionService.configure(this)
	}

  static getSharedInstance(): ConversionService {
		return ApplicationConversionService.sharedInstance
  }

  static configure(registry: FormatterRegistry) {
		DefaultConversionService.addDefaultConverters(registry)
		// DefaultFormattingConversionService.addDefaultFormatters(registry)
		ApplicationConversionService.addApplicationFormatters(registry)
		ApplicationConversionService.addApplicationConverters(registry)
  }

  static addApplicationFormatters(registry: FormatterRegistry) {
		// registry.addFormatter(new CharArrayFormatter())
		// registry.addFormatter(new InetAddressFormatter())
		// registry.addFormatter(new IsoOffsetFormatter())
	}

  static addApplicationConverters(registry: ConverterRegistry) {
		ApplicationConversionService.addDelimitedStringConverters(registry)
		// registry.addConverter(new StringToDurationConverter())
		// registry.addConverter(new DurationToStringConverter())
		// registry.addConverter(new NumberToDurationConverter())
		// registry.addConverter(new DurationToNumberConverter())
		// registry.addConverter(new StringToDataSizeConverter())
		// registry.addConverter(new NumberToDataSizeConverter())
		// registry.addConverter(new StringToFileConverter())
		// registry.addConverterFactory(new LenientStringToEnumConverterFactory())
		// registry.addConverterFactory(new LenientBooleanToEnumConverterFactory())
  }

  static addDelimitedStringConverters(registry: ConverterRegistry) {
		const service = registry as any as ConversionService
		// registry.addConverter(new ArrayToDelimitedStringConverter(service))
		// registry.addConverter(new CollectionToDelimitedStringConverter(service))
		registry.addConverter(new DelimitedStringToArrayConverter(service))
		// registry.addConverter(new DelimitedStringToCollectionConverter(service))
	}
}
