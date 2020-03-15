import { PropertySourceLoader } from './PropertySourceLoader'
import { Implements, Resource, PropertySource } from '@tspring/core'

@Implements(PropertySourceLoader)
export class PropertiesPropertySourceLoader implements PropertySourceLoader {
  getFileExtensions(): string[] {
    return [ 'properties', 'xml' ]
  }

  load(name: string, resource: Resource): PropertySource<Object>[] {
    return []
  }

}
