import { Class, IllegalStateException, CollectionUtils, Environment, isImplements, ResourceLoader, ConfigurableEnvironment, StandardEnvironment, Interface, SpringFactoriesLoader, AnnotationAwareOrderComparator, ConfigurableConversionService, IllegalArgumentException, MapPropertySource } from '@tspring/core'
import { AnnotationConfigUtils, GenericApplicationContext, AbstractApplicationContext, ApplicationListener, ApplicationContextInitializer, ApplicationEvent, ConfigurableApplicationContext, ApplicationContext } from '@tspring/context'
import { SpringApplicationRunListeners } from './SpringApplicationRunListeners'
import { DefaultListableBeanFactory, BeanDefinitionRegistry, BeanNameGenerator } from '@tspring/beans'
import { BeanDefinitionLoader } from './BeanDefinitionLoader'
import { SpringApplicationRunListener } from './SpringApplicationRunListener'
import { ConfigurationPropertySources } from './autoconfigure/context/properties/source/ConfigurationPropertySources'
import { ApplicationConversionService } from './convert/ApplicationConversionService'


export class SpringApplication {
  private resourceLoader?: ResourceLoader
  private primarySources: Class<Object>[]
	private lazyInitialization = false
	private beanNameGenerator?: BeanNameGenerator
  private addConversionService = true
  private webApplicationType = undefined
  private applicationContextClass?: Class<ConfigurableApplicationContext>
	private sources = new Set<string>()
  private environment?: ConfigurableEnvironment
	private defaultProperties?: Map<string, Object>

  private static readonly DEFAULT_CONTEXT_CLASS = '@tspring/context:AnnotationConfigApplicationContext'
  private initializers?: ApplicationContextInitializer<ConfigurableApplicationContext>[]
	private listeners?: ApplicationListener<ApplicationEvent>[]

  constructor(...primarySources: Class<Object>[])
  constructor(resourceLoader: ResourceLoader, ...primarySources: Class<Object>[])

	constructor(arg1: ResourceLoader | Class<Object>, ...primarySources: Class<Object>[]) {
    if (Class.isClass(arg1)) {
      primarySources.unshift(arg1)
    } else {
      this.resourceLoader = arg1
    }
    this.primarySources = primarySources
    // this.webApplicationType = WebApplicationType.deduceFromClasspath()
    this.setInitializers(this.getSpringFactoriesInstances<ApplicationContextInitializer<ConfigurableApplicationContext>>(ApplicationContextInitializer))
		this.setListeners(this.getSpringFactoriesInstances<ApplicationListener<ApplicationEvent>>(ApplicationListener))
		// this.mainApplicationClass = deduceMainApplicationClass()
  }

  getResourceLoader() {
		return this.resourceLoader
  }

  getListeners() {
		return this.listeners || []
	}

  setInitializers<T extends ApplicationContextInitializer<ConfigurableApplicationContext>>(initializers: T[]) {
		this.initializers = initializers
	}

  setListeners<T extends ApplicationListener<ApplicationEvent>>(listeners: T[]) {
		this.listeners = listeners
  }

	private getRunListeners(args: string[]) {
    return new SpringApplicationRunListeners(this.getSpringFactoriesInstances(SpringApplicationRunListener, [], this, ...args))
  }

  private getSpringFactoriesInstances<T>(type: Class<T> | Interface): T[]
  private getSpringFactoriesInstances<T>(type: Class<T> | Interface, parameterTypes: Class<Object>[], ...args: Object[]): T[]

  private getSpringFactoriesInstances<T>(type: Class<T> | Interface, parameterTypes: Class<Object>[] = [], ...args: Object[]): T[] {
		// Use names and ensure unique to protect against duplicates
    const names = new Set<string>(SpringFactoriesLoader.loadFactoryNames(type, Class.getResource(SpringApplication, '/')))
		const instances = this.createSpringFactoriesInstances(type, parameterTypes, args, names)
		AnnotationAwareOrderComparator.sort(instances)
		return instances
  }

  private createSpringFactoriesInstances<T>(type: Class<T> | Interface, parameterTypes: Class<Object>[], args: Object[], names: Set<string>) {
    const instances: T[] = []
    for (const name of names) {
      try {
        const instanceClass = Class.forName(name)
        // Constructor<?> constructor = instanceClass.getDeclaredConstructor(parameterTypes)
        const instance = new instanceClass(...args) as T
        instances.push(instance)
      }
      catch (ex) {
        throw new IllegalArgumentException(`Cannot instantiate ${type}: ${name}`, ex)
      }
    }
    return instances
  }

  protected postProcessApplicationContext(context: ConfigurableApplicationContext) {
		if (this.beanNameGenerator) {
			context.getBeanFactory().registerSingleton(AnnotationConfigUtils.CONFIGURATION_BEAN_NAME_GENERATOR,	this.beanNameGenerator)
		}
		if (this.resourceLoader != undefined) {
			if (context instanceof GenericApplicationContext) {
				context.setResourceLoader(this.resourceLoader)
			}
		}
		if (this.addConversionService) {
			context.getBeanFactory().setConversionService(ApplicationConversionService.getSharedInstance())
		}
  }

  protected applyInitializers(context: ConfigurableApplicationContext) {
		// for (const initializer of this.getInitializers()) {
		// 	GenericTypeResolver.resolveTypeArgument(initializer.constructor,	ApplicationContextInitializer)
		// 	initializer.initialize(context)
		// }
	}

  private prepareContext(context: ConfigurableApplicationContext, environment: Environment, listeners: SpringApplicationRunListeners, applicationArguments: string[], printedBanner: any) {
    context.setEnvironment(environment)
    this.postProcessApplicationContext(context)
    this.applyInitializers(context)
    listeners.contextPrepared(context)

    // Add boot specific singleton beans
    const beanFactory = context.getBeanFactory()
    beanFactory.registerSingleton('springApplicationArguments', applicationArguments)

    if (printedBanner) {
      // beanFactory.registerSingleton('springBootBanner', printedBanner)
    }

    if (beanFactory instanceof DefaultListableBeanFactory) {
      // beanFactory.setAllowBeanDefinitionOverriding(this.allowBeanDefinitionOverriding)
    }
    if (this.lazyInitialization) {
      // context.addBeanFactoryPostProcessor(new LazyInitializationBeanFactoryPostProcessor())
    }
    // Load the sources
    const sources = this.getAllSources()
    this.load(context, Array.from(sources))
    listeners.contextLoaded(context)
  }

  protected createBeanDefinitionLoader(registry: BeanDefinitionRegistry, sources: Object[]) {
		return new BeanDefinitionLoader(registry, ...sources)
  }

  private getBeanDefinitionRegistry(context: ApplicationContext): BeanDefinitionRegistry {
		if (isImplements<BeanDefinitionRegistry>(context, BeanDefinitionRegistry)) {
			return context
		}
		if (context instanceof AbstractApplicationContext) {
			return context.getBeanFactory() as any as BeanDefinitionRegistry
		}
		throw new IllegalStateException('Could not locate BeanDefinitionRegistry')
	}

  protected load(context: ApplicationContext, sources: Object[]) {
		console.debug('Loading source: ', sources.length)
		const loader = this.createBeanDefinitionLoader(this.getBeanDefinitionRegistry(context), sources)
		if (this.beanNameGenerator != undefined) {
			loader.setBeanNameGenerator(this.beanNameGenerator)
		}
		if (this.resourceLoader != undefined) {
			loader.setResourceLoader(this.resourceLoader)
		}
		if (this.environment != undefined) {
			loader.setEnvironment(this.environment)
		}
		loader.load()
	}

  getAllSources() {
		const allSources = new Set<any>()
		if (!CollectionUtils.isEmpty(this.primarySources)) {
			CollectionUtils.addAll(allSources, this.primarySources)
		}
		if (!CollectionUtils.isEmpty(this.sources)) {
			CollectionUtils.addAll(allSources, this.sources)
		}
		return allSources
	}

  protected refresh(applicationContext: ApplicationContext) {
    if (applicationContext instanceof AbstractApplicationContext) {
      applicationContext.refresh()
    }
  }

  private refreshContext(context: ConfigurableApplicationContext) {
		this.refresh(context)
		// if (this.registerShutdownHook) {
		// 	try {
		// 		context.registerShutdownHook()
		// 	} catch (ex) {
		// 		// Not allowed in some environments.
		// 	}
		// }
	}

  protected afterRefresh(context: ConfigurableApplicationContext, args: string[]) {

  }

  private callRunners(context: ApplicationContext, args: string[]) {
		// const runners: any[] = []
		// runners.push(context.getBeansOfType(ApplicationRunner).values())
		// runners.push(context.getBeansOfType(CommandLineRunner).values())
    // AnnotationAwareOrderComparator.sort(runners)

		// for (const runner of runners) {
		// 	if (runner instanceof ApplicationRunner) {
		// 		this.callRunner(runner, args)
		// 	}
		// 	if (runner instanceof CommandLineRunner) {
		// 		this.callRunner(runner, args)
		// 	}
		// }
  }

  private handleRunFailure(
    context: ConfigurableApplicationContext | undefined,
    exception: Error,
    exceptionReporters: any,
    listeners?: SpringApplicationRunListeners
  ) {
    try {
      try {
        // this.handleExitCode(context, exception)
        if (listeners) {
          listeners.failed(context!, exception)
        }
      }
      finally {
        // this.reportFailure(exceptionReporters, exception)
        if (context) {
          context.close()
        }
      }
    } catch (ex) {
      console.warn('Unable to close ApplicationContext', ex)
      throw ex
    }
    throw exception
  }

  protected createApplicationContext (): ConfigurableApplicationContext {
    let contextClass = this.applicationContextClass
    if (contextClass == undefined) {
      try {
        switch (this.webApplicationType) {
        // case SERVLET:
        //   contextClass = Class.forName<ConfigurableApplicationContext>(DEFAULT_SERVLET_WEB_CONTEXT_CLASS)
        //   break
        // case REACTIVE:
        //   contextClass = Class.forName<ConfigurableApplicationContext>(DEFAULT_REACTIVE_WEB_CONTEXT_CLASS)
        //   break
          default:
            contextClass = Class.forName<ConfigurableApplicationContext>(SpringApplication.DEFAULT_CONTEXT_CLASS)
        }
      } catch (ex) {
        throw new IllegalStateException('Unable create a default ApplicationContext, please specify an ApplicationContextClass', ex)
      }
    }
    return new contextClass()
  }

  run (args: string[]) {
    let context: ConfigurableApplicationContext | undefined
    const exceptionReporters = undefined // :SpringBootExceptionReporter[] = []
    // this.configureHeadlessProperty()

		const listeners = this.getRunListeners(args)
    listeners.starting()

		try {
			const applicationArguments = args
			const environment = this.prepareEnvironment(listeners, applicationArguments)
      // configureIgnoreBeanInfo(environment)

			context = this.createApplicationContext()
			// exceptionReporters = this.getSpringFactoriesInstances(SpringBootExceptionReporter,	[ConfigurableApplicationContext], context)
      this.prepareContext(context, environment, listeners, applicationArguments, undefined)
			this.refreshContext(context)
			this.afterRefresh(context, applicationArguments)
			listeners.started(context)
			this.callRunners(context, applicationArguments)
		} catch (ex) {
			this.handleRunFailure(context, ex, exceptionReporters, listeners)
			throw new IllegalStateException(ex)
		}

		try {
			listeners.running(context)
		} catch (ex) {
			this.handleRunFailure(context, ex, exceptionReporters)
			throw new IllegalStateException(ex)
		}
		return context
  }

  private getOrCreateEnvironment() {
		if (this.environment != undefined) {
			return this.environment
		}
		switch (this.webApplicationType) {
      // case SERVLET:
      //   return new StandardServletEnvironment()
      // case REACTIVE:
      //   return new StandardReactiveWebEnvironment()
      default:
        return new StandardEnvironment()
		}
  }

  protected configureEnvironment(environment: ConfigurableEnvironment, args: string[]) {
		if (this.addConversionService) {
			const conversionService = ApplicationConversionService.getSharedInstance()
			environment.setConversionService(conversionService as ConfigurableConversionService)
		}
		this.configurePropertySources(environment, args)
		this.configureProfiles(environment, args)
  }

  protected configurePropertySources(environment: ConfigurableEnvironment, args: string[]) {
		const sources = environment.getPropertySources()
		if (this.defaultProperties != undefined && this.defaultProperties.size > 0) {
			sources.addLast(new MapPropertySource('defaultProperties', this.defaultProperties))
		}
    // TODO: 命令行相关
		// if (this.addCommandLineProperties && args.length > 0) {
		// 	const name = CommandLinePropertySource.COMMAND_LINE_PROPERTY_SOURCE_NAME
		// 	if (sources.contains(name)) {
		// 		const source = sources.get(name)
		// 		const composite = new CompositePropertySource(name)
		// 		composite.addPropertySource(new SimpleCommandLinePropertySource('springApplicationCommandLineArgs', args))
		// 		composite.addPropertySource(source)
		// 		sources.replace(name, composite)
		// 	}
		// 	else {
		// 		sources.addFirst(new SimpleCommandLinePropertySource(args))
		// 	}
		// }
  }

  protected configureProfiles(environment: ConfigurableEnvironment, args: string[]) {
    // const profiles = new Set<string>(this.additionalProfiles)
    // CollectionUtils.addAll(profiles, environment.getActiveProfiles())
		// environment.setActiveProfiles(profiles)
	}

  protected bindToSpringApplication(environment: ConfigurableEnvironment) {
		// try {
		// 	Binder.get(environment).bind('spring.main', Bindable.ofInstance(this))
		// } catch (ex) {
		// 	throw new IllegalStateException('Cannot bind to SpringApplication', ex)
		// }
	}

  private prepareEnvironment(listeners: SpringApplicationRunListeners, applicationArguments: string[]) {
    // Create and configure the environment
    const environment = this.getOrCreateEnvironment()
    this.configureEnvironment(environment, applicationArguments)
    ConfigurationPropertySources.attach(environment)
    listeners.environmentPrepared(environment)
    this.bindToSpringApplication(environment)
    // if (!this.isCustomEnvironment) {
    //   environment = new EnvironmentConverter(getClassLoader()).convertEnvironmentIfNecessary(environment,
    //       deduceEnvironmentClass())
    // }
    ConfigurationPropertySources.attach(environment)
    return environment
  }

  static run (primarySources: Class<Object>, args: string[]) {
    return new SpringApplication(primarySources).run(args)
  }
}
