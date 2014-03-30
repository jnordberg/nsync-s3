var knox = require('knox')
var mime = require('mime')

function S3Transport(options) {
  this.key = options.key
  this.secret = options.secret
  this.bucket = options.bucket
}

S3Transport.prototype.setup = function(callback) {
  this.client = knox.createClient({
    key: this.key,
    secret: this.secret,
    bucket: this.bucket
  })
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
  var headers = {
    'Content-Length': size,
    'Content-Type': mime.lookup(filename)
  }
  this.client.putStream(stream, filename, headers, callback);
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
  }
};

module.exports = S3Transport
