var knox = require('knox'),
    mime = require('mime')

function S3Transport(options) {

  // required config
  this.key = options.key
  this.secret = options.secret
  this.bucket = options.bucket

  // optional config
  this.endpoint = options.endpoint
  this.port = options.port
  this.secure = options.secure
  this.style = options.style
}

S3Transport.prototype.setup = function(callback) {

  var knoxopt = {
    key: this.key,
    secret: this.secret,
    bucket: this.bucket
  }

  if (this.endpoint)
    knoxopt.endpoint = this.endpoint

  if (this.port)
    knoxopt.port = this.port

  if (this.secure)
    knoxopt.secure = this.secure

  if (this.style)
    knoxopt.style = this.style
  
  this.client = knox.createClient(knoxopt)
  
  callback()
}

S3Transport.prototype.cleanup = function(callback) {
  callback()
}

S3Transport.prototype.listDirectory = function(dirname, callback) {
  var prefix = dirname.replace(/^(.\/|\/)/g, '')
  this.client.list({prefix: prefix}, function(error, data) {
    var files
    if (data != null) {
      files = data.Contents.map(function(item) {
        return item.Key
      })
    }
    callback(error, files)
  })
}

S3Transport.prototype.makeDirectory = function(dirname, callback) {
  callback()
}

S3Transport.prototype.deleteDirectory = function(dirname, callback) {
  callback()
}

S3Transport.prototype.getFile = function(filename, callback) {
  this.client.getFile(filename, callback)
}

S3Transport.prototype.putFile = function(filename, size, stream, callback) {
  var self = this
  var headers = {
    'Content-Length': size,
    'Content-Type': mime.lookup(filename)
  }
  var putStream = this.client.putStream(stream, filename, headers, function(error, res) {
    res.resume() // TODO: handle errors?
    callback(error)
  })
  putStream.on('error', function(error) {
    self.logger.error(error)
  })
}

S3Transport.prototype.deleteFile = function(filename, callback) {
  this.client.deleteFile(filename, callback)
}

S3Transport.options = {
  key: {
    required: true,
    description: 'S3 key'
  },
  secret: {
    required: true,
    description: 'S3 secret'
  },
  bucket: {
    required: true,
    description: 'S3 bucket'
  },
  region: {
    required: false,
    description: 'S3 region'
  },
  endpoint: {
    required: false,
    description: 'S3 endpoint'
  },
  port: {
    required: false,
    description: 'S3 endpoint port'
  },
  secure: {
    required: false,
    description: 'S3 https transport'
  },
  style: {
    required: false,
    description: 'S3 url style'
  }
};

module.exports = S3Transport
