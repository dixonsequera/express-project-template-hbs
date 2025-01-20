module.exports = {
  toUpperCase: (string) => string.toUpperCase(),
  eq: (string1, string2, options) => { 
    return string1 === string2 ? options.fn(this) : options.inverse(this)
  },
  notEq: (string1, string2, options) => { 
    return string1 !== string2 ? options.fn(this) : options.inverse(this)
  }
}



