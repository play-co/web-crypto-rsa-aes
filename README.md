Easy encryption with RSA and AES.  Defaults to RSA with 2048 bits and AES-CBC
with 128 bits.

Only use this library if you fully understand the pitfalls of cryptography and
WebCrypto in particular.

 - https://tonyarcieri.com/whats-wrong-with-webcrypto
 - https://www.nccgroup.trust/us/about-us/newsroom-and-events/blog/2011/august/javascript-cryptography-considered-harmful/

# API

 - `createRSAKey(key : JWKKey)` - pass in a JWK key. The python scripts in the
   `scripts/` folder might help you convert a pem file into the correct
   format. Resulting key object can then be passed into any of the other APIs.
 - `decryptRSA(data, key)` - data is an ArrayBuffer or Uint8Array, data is
   split into chunks if larger than the RSA key size
 - `encryptRSA(data, key)` - data is an ArrayBuffer or Uint8Array, data is
   split into chunks if larger than the RSA key size
 - `decryptRSAAES(data, key, rsaBits=2048, nonceBits=128)` - decrypts with
   RSA+AES (see encryptRSAAES)
 - `encryptRSAAES(data, key, rsaBits=2048, nonceBits=128)` - creates a random
   AES key, encrypts it with RSA, and encrypts the data itself with AES.

# Building

 - `npm run build` --> `dist/rsaaes.js`

# Development

 - `webpack --watch`
