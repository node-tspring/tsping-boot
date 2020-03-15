import { Class, Supplier, TypeDef } from '@tspring/core'

export class Bindable<T> {
  private type: TypeDef
  private value?: Supplier<T>

  constructor(type: TypeDef, value?: Supplier<T>) {
    this.type = type
		this.value = value
  }

  getType(): Class<T> {
    return this.type as Class<T>
  }

	getValue(): Supplier<T> | undefined {
    return this.value
  }

  static of<T>(type: TypeDef, value?: Supplier<T>): Bindable<T> {
    return new Bindable<T>(type, value)
	}
}
