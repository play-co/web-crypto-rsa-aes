import 'webcrypto-shim';

// export crypto (webcrypto-shim will handle exposing this for ie11)
export const crypto = window.crypto || null;

// webcrypto doesn't work if protocol is http
export const supportsWebcrypto = !!crypto && crypto.subtle && window.location.protocol === 'https:';

export { string_to_bytes as stringToBytes, bytes_to_string as bytesToString } from '../lib/asmcrypto';
export { createRSAKey } from './keys';
export { decryptRSA, decryptRSAAES } from './decrypt';
export { encryptRSA, encryptRSAAES } from './encrypt';
