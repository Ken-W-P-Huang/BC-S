/* global FormData self Blob File */
/* eslint-disable no-inner-declarations */

if (typeof Blob === 'function' && (typeof FormData === 'undefined' || !FormData.prototype.keys)) {
  const global = typeof window === 'object'
    ? window
    : typeof self === 'object' ? self : this

  // keep a reference to native implementation
  const _FormData = global.FormData

  // To be monkey patched
  const _send = global.XMLHttpRequest && global.XMLHttpRequest.prototype.send
  const _fetch = global.Request && global.fetch

  // Unable to patch Request constructor correctly
  // const _Request = global.Request
  // only way is to use ES6 class extend
  // https://github.com/babel/babel/issues/1966

  const stringTag = global.Symbol && Symbol.toStringTag
  const map = new WeakMap()
  const wm = o => map.get(o)

  // Add missing stringTags to blob and files
  if (stringTag) {
    if (!Blob.prototype[stringTag]) {
      Blob.prototype[stringTag] = 'Blob'
    }

    if ('File' in global && !File.prototype[stringTag]) {
      File.prototype[stringTag] = 'File'
    }
  }

  // Fix so you can construct your own File
  try {
    new File([], '') // eslint-disable-line
  } catch (a) {
    global.File = function File (b, d, c) {
      const blob = new Blob(b, c)
      const t = c && void 0 !== c.lastModified ? new Date(c.lastModified) : new Date()

      Object.defineProperties(blob, {
        name: {
          value: d
        },
        lastModifiedDate: {
          value: t
        },
        lastModified: {
          value: +t
        },
        toString: {
          value () {
            return '[object File]'
          }
        }
      })

      if (stringTag) {
        Object.defineProperty(blob, stringTag, {
          value: 'File'
        })
      }

      return blob
    }
  }

  function normalizeValue ([value, filename]) {
    if (value instanceof Blob) {
      // Should always returns a new File instance
      // console.assert(fd.get(x) !== fd.get(x))
      value = new File([value], filename, {
        type: value.type,
        lastModified: value.lastModified
      })
    }

    return value
  }

  function ensureArgs (args, expected) {
    if (args.length < expected) {
      throw new TypeError(`${expected} argument required, but only ${args.length} present.`)
    }
  }

  function normalizeArgs (name, value, filename) {
    return value instanceof Blob
      // normalize name and filename if adding an attachment
      ? [String(name), value, filename !== undefined
        ? filename + '' // Cast filename to string if 3th arg isn't undefined
        : typeof value.name === 'string' // if name prop exist
          ? value.name // Use File.name
          : 'blob'] // otherwise fallback to Blob

      // If no attachment, just cast the args to strings
      : [String(name), String(value)]
  }

  // normalize linefeeds for textareas
  // https://html.spec.whatwg.org/multipage/form-elements.html#textarea-line-break-normalisation-transformation
  function normalizeLinefeeds (value) {
    return value.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n')
  }

  function each (arr, cb) {
    for (let i = 0; i < arr.length; i++) {
      cb(arr[i])
    }
  }

  /**
   * @implements {Iterable}
   */
  class FormDataPolyfill {
    /**
     * FormData class
     *
     * @param {HTMLElement=} form
     */
    constructor (form) {
      map.set(this, Object.create(null))

      if (!form) return this

      const self = this

      each(form.elements, elm => {
        if (!elm.name || elm.disabled || elm.type === 'submit' || elm.type === 'button') return

        if (elm.type === 'file') {
          each(elm.files || [], file => {
            self.append(elm.name, file)
          })
        } else if (elm.type === 'select-multiple' || elm.type === 'select-one') {
          each(elm.options, opt => {
            !opt.disabled && opt.selected && self.append(elm.name, opt.value)
          })
        } else if (elm.type === 'checkbox' || elm.type === 'radio') {
          if (elm.checked) self.append(elm.name, elm.value)
        } else {
          const value = elm.type === 'textarea' ? normalizeLinefeeds(elm.value) : elm.value
          self.append(elm.name, value)
        }
      })
    }

    /**
     * Append a field
     *
     * @param   {String}           name      field name
     * @param   {String|Blob|File} value     string / blob / file
     * @param   {String=}          filename  filename to use with blob
     * @return  {Undefined}
     */
    append (name, value, filename) {
      ensureArgs(arguments, 2)
      ;[name, value, filename] = normalizeArgs.apply(null, arguments)
      const map = wm(this)

      if (!map[name]) map[name] = []

      map[name].push([value, filename])
    }

    /**
     * Delete all fields values given name
     *
     * @param   {String}  name  Field name
     * @return  {Undefined}
     */
    delete (name) {
      ensureArgs(arguments, 1)
      delete wm(this)[String(name)]
    }

    /**
     * Iterate over all fields as [name, value]
     *
     * @return {Iterator}
     */
    * entries () {
      const map = wm(this)

      for (let name in map) {
        for (let value of map[name]) {
          yield [name, normalizeValue(value)]
        }
      }
    }

    /**
     * Iterate over all fields
     *
     * @param   {Function}  callback  Executed for each item with parameters (value, name, thisArg)
     * @param   {Object=}   thisArg   `this` context for callback function
     * @return  {Undefined}
     */
    forEach (callback, thisArg) {
      ensureArgs(arguments, 1)
      for (let [name, value] of this) {
        callback.call(thisArg, value, name, this)
      }
    }

    /**
     * Return first field value given name
     * or null if non existen
     *
     * @param   {String}  name      Field name
     * @return  {String|File|null}  value Fields value
     */
    get (name) {
      ensureArgs(arguments, 1)
      const map = wm(this)
      name = String(name)
      return map[name] ? normalizeValue(map[name][0]) : null
    }

    /**
     * Return all fields values given name
     *
     * @param   {String}  name  Fields name
     * @return  {Array}         [{String|File}]
     */
    getAll (name) {
      ensureArgs(arguments, 1)
      return (wm(this)[String(name)] || []).map(normalizeValue)
    }

    /**
     * Check for field name existence
     *
     * @param   {String}   name  Field name
     * @return  {boolean}
     */
    has (name) {
      ensureArgs(arguments, 1)
      return String(name) in wm(this)
    }

    /**
     * Iterate over all fields name
     *
     * @return {Iterator}
     */
    * keys () {
      for (let [name] of this) {
        yield name
      }
    }

    /**
     * Overwrite all values given name
     *
     * @param   {String}    name      Filed name
     * @param   {String}    value     Field value
     * @param   {String=}   filename  Filename (optional)
     * @return  {Undefined}
     */
    set (name, value, filename) {
      ensureArgs(arguments, 2)
      ;[name, value, filename] = normalizeArgs.apply(null, arguments)
      wm(this)[name] = [[value, filename]]
    }

    /**
     * Iterate over all fields
     *
     * @return {Iterator}
     */
    * values () {
      for (let [, value] of this) {
        yield value
      }
    }

    /**
     * Return a native (perhaps degraded) FormData with only a `append` method
     * Can throw if it's not supported
     *
     * @return {FormData}
     */
    ['_asNative'] () {
      const fd = new _FormData()

      for (let [name, value] of this) {
        fd.append(name, value)
      }

      return fd
    }

    /**
     * [_blob description]
     *
     * @return {Blob} [description]
     */
    ['_blob'] () {
      const boundary = '----formdata-polyfill-' + Math.random()
      const chunks = []

      for (let [name, value] of this) {
        chunks.push(`--${boundary}\r\n`)

        if (value instanceof Blob) {
          chunks.push(
            `Content-Disposition: form-data; name="${name}"; filename="${value.name}"\r\n`,
            `Content-Type: ${value.type || 'application/octet-stream'}\r\n\r\n`,
            value,
            '\r\n'
          )
        } else {
          chunks.push(
            `Content-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`
          )
        }
      }

      chunks.push(`--${boundary}--`)

      return new Blob(chunks, {
        type: 'multipart/form-data; boundary=' + boundary
      })
    }

    /**
     * The class itself is iterable
     * alias for formdata.entries()
     *
     * @return  {Iterator}
     */
    [Symbol.iterator] () {
      return this.entries()
    }

    /**
     * Create the default string description.
     *
     * @return  {String} [object FormData]
     */
    toString () {
      return '[object FormData]'
    }
  }

  if (stringTag) {
    /**
     * Create the default string description.
     * It is accessed internally by the Object.prototype.toString().
     *
     * @return {String} FormData
     */
    FormDataPolyfill.prototype[stringTag] = 'FormData'
  }

  // Patch xhr's send method to call _blob transparently
  if (_send) {
    global.XMLHttpRequest.prototype.send = function (data) {
      // I would check if Content-Type isn't already set
      // But xhr lacks getRequestHeaders functionallity
      // https://github.com/jimmywarting/FormData/issues/44
      if (data instanceof FormDataPolyfill) {
        const blob = data['_blob']()
        this.setRequestHeader('Content-Type', blob.type)
        _send.call(this, blob)
      } else {
        _send.call(this, data)
      }
    }
  }

  // Patch fetch's function to call _blob transparently
  if (_fetch) {
    const _fetch = global.fetch

    global.fetch = function (input, init) {
      if (init && init.body && init.body instanceof FormDataPolyfill) {
        init.body = init.body['_blob']()
      }

      return _fetch(input, init)
    }
  }

  global['FormData'] = FormDataPolyfill
}
