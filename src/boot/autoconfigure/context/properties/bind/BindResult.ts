export class BindResult<T> {
  private static UNBOUND = new BindResult<any>(undefined)
  private value: T

  private constructor(value: T) {
		this.value = value
  }

  map<U>(mapper: (value: T) => U): BindResult<U> {
		return BindResult.of<U>(this.value != undefined ? mapper(this.value) : undefined)
	}

  orElse(other: T | undefined): T | undefined {
		return (this.value != undefined) ? this.value : other
  }

  static of<T>(value: T | undefined): BindResult<T> {
    if (value == undefined) {
      return BindResult.UNBOUND
    }
    return new BindResult<T>(value)
  }
}
