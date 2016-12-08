import sys
import base64
import rsa

raw_key = open(sys.argv[1]).read()


def b64(i):
    b = []
    while i:
        b.append(i & 0xFF)
        i >>= 8
    return base64.urlsafe_b64encode(bytearray(reversed(b))).rstrip('=')

if raw_key.startswith('-----BEGIN PUBLIC KEY-----'):
    raw_key = (
        '-----BEGIN RSA PUBLIC KEY-----\n'
        + '\n'.join(raw_key.split('\n')[1:-1])[32:]
        + '\n-----END RSA PUBLIC KEY-----\n'
    )

key = rsa.PublicKey.load_pkcs1(raw_key)
print '''
var asmCryptoPublicKey = [
    hex_to_bytes('%s'),
    hex_to_bytes('%s')
];
''' % (
    # base64.b64encode(pack_bigint(key.n)),
    hex(key.n).rstrip("L").lstrip("0x"),
    hex(key.e).rstrip("L").lstrip("0x")
)


print '''
var asmCryptoPublicKey = [
    base64_to_bytes('%s'),
    base64_to_bytes('%s')
];
''' % (
    b64(key.n),
    b64(key.e)
)


print '''
// copy this one into your JavaScript file
var jwkPublicKey = {
    'kty': 'RSA',
    'use': 'enc',
    'n': '%s',
    'e': '%s'
};
''' % (
    b64(key.n),
    b64(key.e)
)
