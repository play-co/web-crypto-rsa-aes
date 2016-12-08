import { AES_CBC, RSA_OAEP_SHA1 } from '../lib/asmcrypto';

import concatChunks from './concat';

function decryptChunk(chunk, key) {
  if (crypto) {
    return crypto.decrypt({'name': 'RSA-OAEP'}, key.webCryptoKey, chunk);
  } else {
    try {
      return Promise.resolve(RSA_OAEP_SHA1.decrypt(chunk, key.asmCryptoKey));
    } catch (e) {
      return Promise.reject(e);
    }
  }
}

const crypto = window.crypto && window.crypto.subtle || null;

export function decryptRSA(message, key) {
  var chunkSize = key.length;
  var messageLength = message.length || message.byteLength;
  var chunks = [];
  for (var i = 0; i < messageLength; i += chunkSize) {
    var length = Math.min(chunkSize, messageLength - i);
    // decrypting all chunks even if one fails early may protect against some
    // timing attacks
    chunks.push(decryptChunk(message.slice(i, i + length), key));
  }

  return Promise.all(chunks).then(concatChunks);
}

export function decryptRSAAES(data, rsaKey, rsaBits = 2048, nonceBits = 128) {
  let offset = 0;
  const aesKey = data.slice(0, offset += rsaBits / 8);
  const nonce = data.slice(offset, offset += nonceBits / 8);
  const encrypted = data.slice(offset);
  return (crypto ? webCryptoDecryptRSAAES : asmCryptoDecryptRSAAES)(rsaKey, aesKey, nonce, encrypted);
}

export function webCryptoDecryptRSAAES(rsaKey, encryptedKey, nonce, encrypted) {
  return crypto.decrypt({'name': 'RSA-OAEP'}, rsaKey.webCryptoKey, encryptedKey)
    .then(sessionKey => crypto.importKey('raw', sessionKey, 'AES-CBC', false, ['decrypt']))
    .then(webKey => {
      return crypto.decrypt({name: 'AES-CBC', iv: nonce}, webKey, encrypted);
    }).then(decrypted => {
      return new Uint8Array(decrypted);
    });
}

export function asmCryptoDecryptRSAAES(rsaKey, encryptedKey, nonce, encrypted) {
  try {
    const sessionKey = RSA_OAEP_SHA1.decrypt(encryptedKey, rsaKey.asmCryptoKey);
    return Promise.resolve(AES_CBC.decrypt(encrypted, sessionKey, true, nonce));
  } catch (e) {
    return Promise.reject(e);
  }
}
