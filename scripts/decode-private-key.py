import sys
import base64
import rsa


def b64(i):
    b = []
    while i:
        b.append(i & 0xFF)
        i >>= 8

    return base64.urlsafe_b64encode(bytearray(reversed(b))).rstrip('=')


raw = open(sys.argv[1]).read()
key = rsa.PrivateKey.load_pkcs1(raw)

def to_hex(val):
    return hex(val).rstrip("L").lstrip("0x")

print '''
var asmCryptoPrivateKey = ['%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s'].map(hex_to_bytes);
''' % tuple(
    to_hex(val)
    for val in [key.n, key.e, key.d, key.p, key.q, key.exp1, key.exp2, key.coef]
)


print '''
var asmCryptoPrivateKey = ['%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s'].map(base64_to_bytes);
''' % tuple(
    b64(val)
    for val in [key.n, key.e, key.d, key.p, key.q, key.exp1, key.exp2, key.coef]
)

print '''
// copy this one into your JavaScript file
var jwkPrivateKey = {
  'kty': 'RSA',
  'use': 'enc',
  'n': '%s',
  'e': '%s',
  'd': '%s',
  'p': '%s',
  'q': '%s',
  'dp': '%s',
  'dq': '%s',
  'qi': '%s'
};

''' % tuple(
    b64(val)
    for val in [key.n, key.e, key.d, key.p, key.q, key.exp1, key.exp2, key.coef]
)
