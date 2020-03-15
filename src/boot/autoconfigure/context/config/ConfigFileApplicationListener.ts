import { Ordered, ConfigurableEnvironment, Implements, Class, SpringFactoriesLoader, AnnotationAwareOrderComparator, ResourceLoader, DefaultResourceLoader, MutablePropertySources, PropertySource, BiConsumer, CollectionUtils, StringUtils, ResourceUtils, IllegalStateException, Resource, GenericType } from '@tspring/core'
import { SmartApplicationListener, ApplicationEvent, ConfigurableApplicationContext } from '@tspring/context'
import { EnvironmentPostProcessor } from '../../../env/EnvironmentPostProcessor'
import { SpringApplication } from '../../../SpringApplication'
import { ApplicationEnvironmentPreparedEvent } from '../../../context/event/ApplicationEnvironmentPreparedEvent'
import { ApplicationPreparedEvent } from '../../../context/event/ApplicationPreparedEvent'
import { PropertySourceLoader } from '../../../env/PropertySourceLoader'
import { PropertySourcesPlaceholdersResolver } from '../properties/bind/PropertySourcesPlaceholdersResolver'
import { FilteredPropertySource } from './FilteredPropertySource'
import { Binder } from '../properties/bind/Binder'
import { ConfigurationPropertySources } from '../properties/source/ConfigurationPropertySources'
import { Bindable } from '../properties/bind/Bindable'

const DEFAULT_ORDER = Ordered.HIGHEST_PRECEDENCE + 10

const DEFAULT_PROPERTIES = 'defaultProperties'
const DEFAULT_NAMES = 'application'
const CONFIG_NAME_PROPERTY = 'spring.config.name'
const CONFIG_LOCATION_PROPERTY = 'spring.config.location'
const CONFIG_ADDITIONAL_LOCATION_PROPERTY = 'spring.config.additional-location'
const DEFAULT_SEARCH_LOCATIONS = 'classpath:/,classpath:/config/,file:./,file:./config/'
const INCLUDE_PROFILES_PROPERTY = 'spring.profiles.include'
const ACTIVE_PROFILES_PROPERTY = 'spring.profiles.active'
const STRING_ARRAY = Bindable.of<string[]>(GenericType.StringArray)

const filteredProperties = new Set<string>()
filteredProperties.add('spring.profiles.active')
filteredProperties.add('spring.profiles.include')
const LOAD_FILTERED_PROPERTY = filteredProperties // Collections.unmodifiableSet(filteredProperties)
const NO_SEARCH_NAMES = new Set<string | undefined>([undefined])


class DocumentsCacheKey {

  private loader: PropertySourceLoader

  private resource: Resource

  constructor(loader: PropertySourceLoader, resource: Resource ) {
    this.loader = loader
    this.resource = resource
  }

  equals(obj: Object): boolean {
    if (this == obj) {
      return true
    }
    if (obj == undefined || this.constructor != obj.constructor) {
      return false
    }
    const other = obj as DocumentsCacheKey
    // return this.loader.equals(other.loader) && this.resource.equals(other.resource)
    return this.loader == other.loader && this.resource.getURL().toJSON() == other.resource.getURL().toJSON()

  }

  // hashCode(): number {
  //   return this.loader.hashCode() * 31 + this.resource.hashCode()
  // }

}

class Profile {

  private name: string

  private defaultProfile: boolean

  constructor(name: string, defaultProfile = false) {
    this.name = name
    this.defaultProfile = defaultProfile
  }

  getName() {
    return this.name
  }

  isDefaultProfile() {
    return this.defaultProfile
  }

  equals(obj: Object): boolean {
    if (obj == this) {
      return true
    }
    if (obj == undefined || obj.constructor != this.constructor) {
      return false
    }
    return (obj as Profile).name == this.name
  }

  toString() {
    return this.name
  }

}

class Document {

  private propertySource: PropertySource<Object>

  private profiles?: string[]

  private activeProfiles: Set<Profile>

  private includeProfiles: Set<Profile>

  constructor(propertySource: PropertySource<Object>, profiles: string[] | undefined, activeProfiles: Set<Profile>, includeProfiles: Set<Profile>) {
    this.propertySource = propertySource
    this.profiles = profiles
    this.activeProfiles = activeProfiles
    this.includeProfiles = includeProfiles
  }

  getPropertySource() {
    return this.propertySource
  }

  getProfiles() {
    return this.profiles
  }

  getActiveProfiles() {
    return this.activeProfiles
  }

  getIncludeProfiles() {
    return this.includeProfiles
  }

  toString() {
    return this.propertySource.toString()
  }

}

interface DocumentConsumer {
  accept(profile: Profile | undefined, document: Document | undefined): void
}

interface DocumentFilter {
  match(document: Document | undefined): boolean
}

interface DocumentFilterFactory {
  getDocumentFilter(profile: Profile | undefined): DocumentFilter
}

@Implements(EnvironmentPostProcessor, SmartApplicationListener, Ordered)
export class ConfigFileApplicationListener implements EnvironmentPostProcessor, SmartApplicationListener, Ordered {
  static readonly DEFAULT_ORDER = DEFAULT_ORDER
  static readonly CONFIG_NAME_PROPERTY = CONFIG_NAME_PROPERTY
  static readonly CONFIG_LOCATION_PROPERTY = CONFIG_LOCATION_PROPERTY
  static readonly CONFIG_ADDITIONAL_LOCATION_PROPERTY = CONFIG_ADDITIONAL_LOCATION_PROPERTY
  static readonly INCLUDE_PROFILES_PROPERTY = INCLUDE_PROFILES_PROPERTY
  static readonly ACTIVE_PROFILES_PROPERTY = ACTIVE_PROFILES_PROPERTY

	private order = DEFAULT_ORDER
  private names?: string
	private searchLocations?: string

  setOrder(order: number) {
		this.order = order
  }

  getOrder(): number {
    return this.order
  }

  postProcessEnvironment(environment: ConfigurableEnvironment, application: SpringApplication): void {
		this.addPropertySources(environment, application.getResourceLoader())
  }

  protected addPropertySources(environment: ConfigurableEnvironment, resourceLoader: ResourceLoader | undefined) {
		// RandomValuePropertySource.addToEnvironment(environment)
		new this.Loader(environment, resourceLoader).load()
	}

  supportsEventType<T extends ApplicationEvent>(eventType: Class<T>): boolean {
    return Class.isAssignableFrom(ApplicationEnvironmentPreparedEvent, eventType)
				|| Class.isAssignableFrom(ApplicationPreparedEvent, eventType)
  }

  supportsSourceType(sourceType: Class<Object> | undefined): boolean {
    return true
  }

  onApplicationEvent(event: ApplicationEvent): void {
    if (event instanceof ApplicationEnvironmentPreparedEvent) {
			this.onApplicationEnvironmentPreparedEvent(event)
		}
		if (event instanceof ApplicationPreparedEvent) {
			this.onApplicationPreparedEvent(event)
		}
  }

  loadPostProcessors() {
		return SpringFactoriesLoader.loadFactories<EnvironmentPostProcessor>(
      EnvironmentPostProcessor,
      Class.getResource(ConfigFileApplicationListener, '/')
    )
  }

  onApplicationEnvironmentPreparedEvent(event: ApplicationEnvironmentPreparedEvent) {
		const postProcessors = this.loadPostProcessors()
		postProcessors.push(this)
		AnnotationAwareOrderComparator.sort(postProcessors)
		for (const postProcessor of postProcessors) {
			postProcessor.postProcessEnvironment(event.getEnvironment(), event.getSpringApplication())
		}
  }

  onApplicationPreparedEvent(event: ApplicationEvent) {
		// this.logger.switchTo(ConfigFileApplicationListener.class)
		this.addPostProcessors((event as ApplicationPreparedEvent).getApplicationContext())
  }

  protected addPostProcessors(context: ConfigurableApplicationContext) {
		// context.addBeanFactoryPostProcessor(new PropertySourceOrderingPostProcessor(context))
  }

	private Loader = ((outerThis) => class Loader {
    private environment: ConfigurableEnvironment
    private propertySourceLoaders: PropertySourceLoader[]
    private placeholdersResolver: PropertySourcesPlaceholdersResolver
    private resourceLoader: ResourceLoader
		private profiles?: (Profile|undefined)[]
		private processedProfiles?: Profile[]
    private activatedProfiles?: boolean
		private loaded?: Map<Profile, MutablePropertySources>
    private loadDocumentsCache = new Map<DocumentsCacheKey, Document[]>()

    constructor(environment: ConfigurableEnvironment, resourceLoader: ResourceLoader | undefined) {
      this.environment = environment
			this.placeholdersResolver = new PropertySourcesPlaceholdersResolver(this.environment)
			this.resourceLoader = (resourceLoader != undefined) ? resourceLoader : new DefaultResourceLoader()
			this.propertySourceLoaders = SpringFactoriesLoader.loadFactories<PropertySourceLoader>(
        PropertySourceLoader,
        Class.getResource(ConfigFileApplicationListener, '/')
      )
    }

    load () {
      FilteredPropertySource.apply(
        this.environment,
        DEFAULT_PROPERTIES,
        LOAD_FILTERED_PROPERTY,
        {
          accept: (defaultProperties) => {
            this.profiles = []
            this.processedProfiles = []
            this.activatedProfiles = false
            this.loaded = new Map()
            this.initializeProfiles()
            while (this.profiles.length > 0) {
              const profile = this.profiles.shift()
              if (this.isDefaultProfile(profile)) {
                this.addProfileToEnvironment(profile!.getName())
              }
              this.$load(
                profile,
                {
                  getDocumentFilter: (profile: Profile) => {
                    return this.getPositiveProfileFilter(profile)
                  }
                },
                this.addToLoaded(
                  {
                    accept: (target: MutablePropertySources, propertySource: PropertySource<Object>) => {
                      target.addLast(propertySource)
                    }
                  },
                  false
                )
              )
              this.processedProfiles.push(profile!)
            }
            this.$load(
              undefined,
              {
                getDocumentFilter: (profile: Profile) => this.getNegativeProfileFilter(profile)
              },
              this.addToLoaded(
                {
                  accept: (target: MutablePropertySources, propertySource: PropertySource<Object>) => {
                    target.addFirst(propertySource)
                  }
                },
                true
              )
            )
            this.addLoadedPropertySources()
            this.applyActiveProfiles(defaultProperties)
          }
        })
    }

    private applyActiveProfiles(defaultProperties: PropertySource<Object> | undefined) {
			const activeProfiles: string[] = []
			if (defaultProperties != undefined) {
				// Binder binder = new Binder(ConfigurationPropertySources.from(defaultProperties),
				// 		new PropertySourcesPlaceholdersResolver(this.environment))
				// activeProfiles.addAll(getDefaultProfiles(binder, 'spring.profiles.include'))
				// if (!this.activatedProfiles) {
				// 	activeProfiles.addAll(getDefaultProfiles(binder, 'spring.profiles.active'))
				// }
			}
      this.processedProfiles!
        .filter(processedProfile => {
          return this.isDefaultProfile(processedProfile)
        })
        .map(processedProfile => processedProfile.getName())
				.forEach(name => {
          activeProfiles.push(name)
        })
			this.environment.setActiveProfiles(...activeProfiles)
		}

    private addLoadedPropertySources() {
			const destination = this.environment.getPropertySources()
      const loaded = [...this.loaded!.values()]
      loaded.reverse()
			// Collections.reverse(loaded)
			let lastAdded = undefined
			const added = new Set<string>()
			for (const sources of loaded) {
				for (const source of sources) {
					if (added.add(source.getName())) {
						this.addLoadedPropertySource(destination, lastAdded, source)
						lastAdded = source.getName()
					}
				}
			}
    }

    private addLoadedPropertySource(destination: MutablePropertySources, lastAdded: string | undefined, source: PropertySource<Object>) {
      if (lastAdded == undefined) {
        if (destination.contains(DEFAULT_PROPERTIES)) {
          destination.addBefore(DEFAULT_PROPERTIES, source)
        }
        else {
          destination.addLast(source)
        }
      }
      else {
        destination.addAfter(lastAdded, source)
      }
    }

    private getNegativeProfileFilter(profile: Profile): DocumentFilter {
      return {
        match: () => {
          return false
          // return (document: Document) => (profile == undefined && !ObjectUtils.isEmpty(document.getProfiles())
					//   && this.environment.acceptsProfiles(Profiles.of(document.getProfiles())))
        }
      }
    }

    private getPositiveProfileFilter(profile: Profile): DocumentFilter {
			return {
        match: (document: Document) => {
          if (profile == undefined) {
            return CollectionUtils.isEmpty(document.getProfiles())
          }
          return false
          // return ObjectUtils.containsElement(
          //   document.getProfiles(),
          //   profile.getName()) && this.environment.acceptsProfiles(Profiles.of(document.getProfiles())
          // )
        }
      }
		}

    private addToLoaded(addMethod: BiConsumer<MutablePropertySources, PropertySource<Object>>, checkForExisting: boolean): DocumentConsumer {
      return {
        accept: (profile: Profile, document: Document) => {
          if (checkForExisting) {
            for (const merged of this.loaded!.values()) {
              if (merged.contains(document.getPropertySource().getName())) {
                return
              }
            }
          }

          const merged = CollectionUtils.computeIfAbsent(this.loaded!, profile, (k) => new MutablePropertySources())
          addMethod.accept(merged, document.getPropertySource())
        }
      }
    }

    private $load(profile: Profile | undefined, filterFactory: DocumentFilterFactory, consumer: DocumentConsumer): void {
      this.getSearchLocations().forEach((location) => {
				const isFolder = location.endsWith('/')
				const names = isFolder ? this.getSearchNames() : NO_SEARCH_NAMES
				names.forEach((name) => this.$$load(location, name, profile, filterFactory, consumer))
			})
    }

    private getSearchLocations(): Set<string> {
			if (this.environment.containsProperty(CONFIG_LOCATION_PROPERTY)) {
				return this.$getSearchLocations(CONFIG_LOCATION_PROPERTY)
			}
			const locations = this.$getSearchLocations(CONFIG_ADDITIONAL_LOCATION_PROPERTY)
      CollectionUtils.addAll(locations, this.asResolvedSet(outerThis.searchLocations, DEFAULT_SEARCH_LOCATIONS))
			return locations
    }

    private $getSearchLocations(propertyName: string): Set<string> {
			const locations = new Set<string>()
			if (this.environment.containsProperty(propertyName)) {
				for (let path of this.asResolvedSet(this.environment.getProperty(propertyName), undefined)) {
					if (path.indexOf('$') == -1) {
						path = StringUtils.cleanPath(path)
						if (!ResourceUtils.isUrl(path)) {
							path = ResourceUtils.FILE_URL_PREFIX + path
						}
					}
					locations.add(path)
				}
			}
			return locations
		}

    private getSearchNames(): Set<string> {
			if (this.environment.containsProperty(CONFIG_NAME_PROPERTY)) {
				const property = this.environment.getProperty(CONFIG_NAME_PROPERTY)
				return this.asResolvedSet(property, undefined)
			}
			return this.asResolvedSet(outerThis.names, DEFAULT_NAMES)
    }

    private asResolvedSet(value: string | undefined, fallback: string | undefined): Set<string> {
      value = value != undefined
        ? this.environment.resolvePlaceholders(value)
        : (fallback || '')
      const list = value.trim().split(/\s*,\s*/)
      list.reverse() // Collections.reverse(list)
			return new Set(list)
    }

    private canLoadFileExtension(loader: PropertySourceLoader, name: string): boolean {
      return loader
        .getFileExtensions()
        .some(fileExtension => name.toLocaleLowerCase().endsWith(fileExtension.toLocaleLowerCase()))
		}

    private $$load(location: string, name: string | undefined, profile: Profile | undefined, filterFactory: DocumentFilterFactory, consumer: DocumentConsumer): void {
      if (!StringUtils.hasText(name)) {
				for (const loader of this.propertySourceLoaders) {
					if (this.canLoadFileExtension(loader, location)) {
						this.$$$load(loader, location, profile, filterFactory.getDocumentFilter(profile), consumer)
						return
					}
				}
				throw new IllegalStateException(`File extension of config file location '${location}' is not known to any PropertySourceLoader. If the location is meant to reference a directory, it must end in '/'`)
			}
			const processed = new Set<string>()
			for (const loader of this.propertySourceLoaders) {
				for (const fileExtension of loader.getFileExtensions()) {
					if (processed.add(fileExtension)) {
						this.loadForFileExtension(loader, location + name, '.' + fileExtension, profile, filterFactory,
								consumer)
					}
				}
			}
    }

    private loadForFileExtension(loader: PropertySourceLoader, prefix: string, fileExtension: string,	profile: Profile | undefined, filterFactory: DocumentFilterFactory, consumer: DocumentConsumer) {
			const defaultFilter = filterFactory.getDocumentFilter(undefined)
			const profileFilter = filterFactory.getDocumentFilter(profile)
			if (profile != undefined) {
				// Try profile-specific file & profile section in profile file (gh-340)
				const profileSpecificFile = prefix + '-' + profile + fileExtension
				this.$$$load(loader, profileSpecificFile, profile, defaultFilter, consumer)
				this.$$$load(loader, profileSpecificFile, profile, profileFilter, consumer)
				// Try profile specific sections in files we've already processed
				for (const processedProfile of this.processedProfiles!) {
					if (processedProfile != null) {
						const previouslyLoaded = prefix + '-' + processedProfile + fileExtension
						this.$$$load(loader, previouslyLoaded, profile, profileFilter, consumer)
					}
				}
			}
			// Also try the profile-specific section (if any) of the normal file
			this.$$$load(loader, prefix + fileExtension, profile, profileFilter, consumer)
		}

    private $$$load(loader: PropertySourceLoader, location: string, profile: Profile | undefined, filter: DocumentFilter, consumer: DocumentConsumer) {
      console.log('++++++++++>>>>>>>>>', location)
      try {
				const resource = this.resourceLoader.getResource(location)
				if (resource == undefined || !resource.exists()) {
					// const description = this.getDescription('Skipped missing config ', location, resource, profile)
					// console.debug(description)
					return
				}
				if (!StringUtils.hasText(StringUtils.getFilenameExtension(resource.getFilename()))) {
          // const description = this.getDescription('Skipped empty config extension ', location, resource, profile)
          // console.debug(description)
					return
				}
				const name = 'applicationConfig: [' + location + ']'
				const documents = this.loadDocuments(loader, name, resource)
				if (CollectionUtils.isEmpty(documents)) {
          // const description = this.getDescription('Skipped unloaded config ', location, resource, profile)
          // console.debug(description)
					return
				}
				const loaded: Document[] = []
				for (const document of documents) {
					if (filter.match(document)) {
						this.addActiveProfiles(document.getActiveProfiles())
						this.addIncludedProfiles(document.getIncludeProfiles())
						loaded.push(document)
					}
				}
				loaded.reverse() // Collections.reverse(loaded)
				if (loaded.length > 0) {
					loaded.forEach(document => consumer.accept(profile, document))
          // const description = this.getDescription('Loaded config file ', location, resource, profile)
          // console.debug(description)
				}
			}
			catch (ex) {
				throw new IllegalStateException(`Failed to load property source from location '${location}'`, ex)
			}
    }

    private loadDocuments(loader: PropertySourceLoader, name: string, resource: Resource): Document[] {
			const cacheKey = new DocumentsCacheKey(loader, resource)
			let documents = this.loadDocumentsCache.get(cacheKey)
			if (documents == undefined) {
				const loaded = loader.load(name, resource)
				documents = this.asDocuments(loaded)
				this.loadDocumentsCache.set(cacheKey, documents)
			}
			return documents
    }

    private asDocuments(loaded: PropertySource<Object>[]): Document[] {
			if (loaded == null) {
				return []
			}
      return loaded
        .map((propertySource) => {
				  const binder = new Binder(ConfigurationPropertySources.from(propertySource), this.placeholdersResolver)
				  return new Document(
            propertySource,
            binder.bind<string[]>('spring.profiles', STRING_ARRAY).orElse(undefined) as string[] | undefined,
            this.getProfiles(binder, ACTIVE_PROFILES_PROPERTY),
            this.getProfiles(binder, INCLUDE_PROFILES_PROPERTY)
          )
        })
    }

    private addIncludedProfiles(includeProfiles: Set<Profile>) {
			const existingProfiles = [...this.profiles!]
      this.profiles = []
      CollectionUtils.addAll(this.profiles, includeProfiles)
      this.profiles.forEach((profile, index) => {
        if (profile != undefined && this.processedProfiles!.indexOf(profile) != -1) {
          this.profiles!.splice(index, 1)
        }
      })
      CollectionUtils.addAll(this.profiles, existingProfiles)
		}

    private addActiveProfiles(profiles: Set<Profile>) {
			if (profiles.size == 0) {
				return
			}
			if (this.activatedProfiles) {
        console.debug(`Profiles already activated, '${profiles}' will not be applied`)
				return
      }
      CollectionUtils.addAll(this.profiles!, profiles)
      console.debug('Activated activeProfiles ' + Array.from(profiles).join(' , '))
			this.activatedProfiles = true
			this.removeUnprocessedDefaultProfiles()
    }

    private removeUnprocessedDefaultProfiles() {
      this.profiles!.forEach((profile, index) => {
        if (profile != undefined && profile.isDefaultProfile()) {
          this.profiles!.splice(index, 1)
        }
      })
		}

    private addProfileToEnvironment(profile: string) {
			for (const activeProfile of this.environment.getActiveProfiles()) {
				if (activeProfile == profile) {
					return
				}
			}
			this.environment.addActiveProfile(profile)
		}

    private isDefaultProfile(profile: Profile | undefined) {
			return profile != undefined && !profile.isDefaultProfile()
		}

    private initializeProfiles() {
			// The default profile for these purposes is represented as undefined. We add it
			// first so that it is processed first and has lowest priority.
			this.profiles!.push(undefined)
			const activatedViaProperty = this.getProfilesFromProperty(ACTIVE_PROFILES_PROPERTY)
			const includedViaProperty = this.getProfilesFromProperty(INCLUDE_PROFILES_PROPERTY)
			const otherActiveProfiles = this.getOtherActiveProfiles(activatedViaProperty, includedViaProperty)
      CollectionUtils.addAll(this.profiles!, otherActiveProfiles)
			// Any pre-existing active profiles set via property sources (e.g.
			// System properties) take precedence over those added in config files.
      CollectionUtils.addAll(this.profiles!, includedViaProperty)
			this.addActiveProfiles(activatedViaProperty)
			if (this.profiles!.length == 1) { // only has undefined profile
				for (const defaultProfileName of this.environment.getDefaultProfiles()) {
					const defaultProfile = new Profile(defaultProfileName, true)
					this.profiles!.push(defaultProfile)
				}
			}
    }

    private getOtherActiveProfiles(activatedViaProperty: Set<Profile>, includedViaProperty: Set<Profile>): Profile[] {
      return this.environment.getActiveProfiles()
        .map(name => new Profile(name))
        .filter(profile => !activatedViaProperty.has(profile) && !includedViaProperty.has(profile))
    }

    private getProfilesFromProperty(profilesProperty: string): Set<Profile> {
			if (!this.environment.containsProperty(profilesProperty)) {
				return CollectionUtils.emptySet<Profile>()
			}
			// const binder = Binder.get(this.environment)
			// const profiles = this.getProfiles(binder, profilesProperty)
      // return new Set(profiles)
      return CollectionUtils.emptySet()
    }

    private getProfiles(binder: Binder, name: string): Set<Profile> {
      return binder
        .bind<string[]>(name, STRING_ARRAY)
        .map((profileNames) => {
          return this.asProfileSet(profileNames)
        })
        .orElse(CollectionUtils.emptySet())!
    }

    private asProfileSet(profileNames: string[]): Set<Profile> {
			const profiles: Profile[] = []
			for (const profileName of profileNames) {
				profiles.push(new Profile(profileName))
			}
			return new Set(profiles)
		}

  })(this)
}
