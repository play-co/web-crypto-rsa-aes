import { RSA_OAEP_SHA1, AES_CBC, string_to_bytes } from '../lib/asmcrypto';

import concatChunks from './concat';

const crypto = window.crypto && window.crypto.subtle || null;

// this should be polyfilled by asmcrypto either way
const getRandomValues = window.crypto && window.crypto.getRandomValues.bind(window.crypto);

function encryptChunk(chunk, key) {
  if (crypto) {
    return crypto.encrypt({'name': 'RSA-OAEP'}, key.webCryptoKey, chunk);
  } else {
    try {
      return Promise.resolve(RSA_OAEP_SHA1.encrypt(chunk, key.asmCryptoKey));
    } catch (e) {
      return Promise.reject(e);
    }
  }
}

const typedArrays = [
  window.Int8Array,
  window.Int16Array,
  window.Int32Array,
  window.Uint8Array,
  window.Uint8ClampedArray,
  window.Uint16Array,
  window.Uint32Array,
  window.Float32Array,
  window.Float64Array
].filter(ctor => typeof ctor === 'function');

function isTypedArray(a) {
  for (const ctor of typedArrays) {
    if (a instanceof ctor) { return true; }
  }
  return false;
}

function toArrayBuffer(data) {
  if (typeof data === 'string') {
    data = string_to_bytes(data);
  } else if (data instanceof ArrayBuffer) {
    return data;
  } else if (isTypedArray(data)) {
    data = new ArrayBuffer(data);
  }

  return data;
}

export function encryptRSA(arrayBuffer, key) {
  if (!(arrayBuffer instanceof ArrayBuffer)) {
    arrayBuffer = arrayBuffer.buffer;
  }

  var maxLength = key.maxLength;
  var messageLength = arrayBuffer.length || arrayBuffer.byteLength;
  var chunks = [];
  for (var i = 0; i < messageLength; i += maxLength) {
    var chunkSize = Math.min(maxLength, messageLength - i);
    chunks.push(encryptChunk(new Uint8Array(arrayBuffer, i, chunkSize), key));
  }

  return Promise.all(chunks).then(concatChunks);
}

export function encryptRSAAES(data, rsaKey, aesBits=128) {
  const sessionKey = getRandomValues(new Uint8Array(aesBits / 8));
  const nonce = getRandomValues(new Uint8Array(aesBits / 8));
  return (crypto ? webCryptoEncryptRSAAES : asmCryptoEncryptRSAAES)(toArrayBuffer(data), rsaKey, sessionKey, nonce);
}

export function webCryptoEncryptRSAAES(data, rsaKey, sessionKey, nonce) {
  return Promise.all([
    // rsa-encrypt session key
    crypto.encrypt({'name': 'RSA-OAEP'}, rsaKey.webCryptoKey, sessionKey),

    // aes-encrypt data
    crypto.importKey('raw', sessionKey, 'AES-CBC', false, ['encrypt'])
      .then(webKey => crypto.encrypt({'name': 'AES-CBC', iv: nonce}, webKey, data))
  ])
    .then(([sessionKey, encrypted]) => {
      return concatChunks([new Uint8Array(sessionKey), nonce, new Uint8Array(encrypted)]);
    });
}

export function asmCryptoEncryptRSAAES(data, rsaKey, sessionKey, nonce) {
  return Promise.resolve(concatChunks([
    RSA_OAEP_SHA1.encrypt(sessionKey, rsaKey.asmCryptoKey),
    nonce,
    AES_CBC.encrypt(data, sessionKey, true, nonce)
  ]));
}
