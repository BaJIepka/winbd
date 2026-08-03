import '@testing-library/jest-dom'

class LocalStorageMock implements Storage {
  private store: Record<string, string> = {}
  get length() {
    return Object.keys(this.store).length
  }
  key(index: number) {
    return Object.keys(this.store)[index] ?? null
  }
  getItem(key: string) {
    return this.store[key] ?? null
  }
  setItem(key: string, value: string) {
    this.store[key] = String(value)
  }
  removeItem(key: string) {
    Reflect.deleteProperty(this.store, key)
  }
  clear() {
    this.store = {}
  }
}

Object.defineProperty(window, 'localStorage', {
  value: new LocalStorageMock(),
  writable: true,
})
