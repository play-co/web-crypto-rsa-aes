export default function concatChunks(chunks) {
  var n = chunks.length;
  var length = 0;
  for (var i = 0; i < n; ++i) {
    length += chunks[i].length;
  }

  var combined = new Uint8Array(length);
  var offset = 0;
  chunks.forEach(function (chunk) {
    combined.set(chunk, offset);
    offset += chunk.length;
  });

  return combined;
}
