import { base64_to_bytes, SHA1 } from '../lib/asmcrypto';

import { crypto, supportsWebcrypto } from './index';

const DEFAULT_ALGORITHM = {
  name: 'RSA-OAEP',
  hash: {
    name: 'SHA-1'
  }
};

export function createRSAKey(jwk, algorithm=DEFAULT_ALGORITHM) {
  return Promise.resolve()
    .then(() => {
      if (supportsWebcrypto) {
        return crypto.subtle.importKey('jwk', jwk, algorithm, false,
          jwk.d && jwk.p
            ? ['decrypt']
            : ['encrypt']);
      }
    })
    .then(webCryptoKey => {
      const asmCryptoKey = JWKToASMCrypto(jwk);
      const maxLength = asmCryptoKey[0].length - 2 * SHA1.HASH_SIZE - 2;

      return {
        webCryptoKey,
        asmCryptoKey,
        maxLength,
        length: asmCryptoKey[0].length
      };
    });
}

export function JWKToASMCrypto(key) {
  return [
    key.n,
    key.e,
    key.d,
    key.p,
    key.q,
    key.dp,
    key.dq,
    key.qi
  ]
    // public keys don't have the extra fields
    .filter(function (val) { return val; })
    .map(function (val) {
      // convert url-safe base64 to standard base64, then decode to array buffer
      return base64_to_bytes(val.replace(/\-/g, '+').replace(/\_/g, '/'));
    });
}
