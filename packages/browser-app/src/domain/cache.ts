/* eslint-disable @typescript-eslint/explicit-member-accessibility */

export class ClearableWeakMap {
  _wm: WeakMap<any, any>

  constructor () {
    this._wm = new WeakMap()
  }

  clear () {
    this._wm = new WeakMap()
  }

  delete (k: any) {
    return this._wm.delete(k)
  }

  get (k: any) {
    return this._wm.get(k)
  }

  has (k: any) {
    return this._wm.has(k)
  }

  set (k: any, v: any) {
    this._wm.set(k, v)
    return this
  }
}

export const cache = new ClearableWeakMap()
