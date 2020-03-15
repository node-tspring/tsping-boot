import { PropertySourceLoader } from './PropertySourceLoader'
import { Implements, Resource, PropertySource } from '@tspring/core'
import yaml from 'js-yaml'
import fs from 'fs'
import get from 'lodash/get'

class YamlPropertySource extends PropertySource<Object> {
  constructor(name: string)
  constructor(name: string, source: Object)

  constructor(protected name: string, source?: Object) {
    super(name, source!)
  }

  getProperty(name: string): Object | undefined {
    return get(this.source, name)
  }

}

@Implements(PropertySourceLoader)
export class YamlPropertySourceLoader implements PropertySourceLoader {
  getFileExtensions(): string[] {
    return ['yml', 'yaml']
  }

  load(name: string, resource: Resource): PropertySource<Object>[] {
    const source = yaml.load(fs.readFileSync(resource.getURL()).toString())
		return [new YamlPropertySource(name, source)]
  }
}
