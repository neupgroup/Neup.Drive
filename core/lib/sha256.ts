/**
 * A pure TypeScript implementation of SHA-256 with streaming support.
 * Useful for hashing large files in chunks.
 */
export class SHA256 {
  private h: Uint32Array;
  private buffer: Uint8Array;
  private bufferLength: number;
  private totalLength: number; // Total length in bytes

  private static K: Uint32Array = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ]);

  constructor() {
    this.h = new Uint32Array([
      0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
      0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
    ]);
    this.buffer = new Uint8Array(64);
    this.bufferLength = 0;
    this.totalLength = 0;
  }

  /**
   * Updates the hash with a chunk of data.
   */
  public update(data: Uint8Array | ArrayBuffer | string): this {
    if (typeof data === 'string') {
      data = new TextEncoder().encode(data);
    } else if (data instanceof ArrayBuffer) {
      data = new Uint8Array(data);
    }

    let offset = 0;
    let len = data.length;
    this.totalLength += len;

    while (len > 0) {
      const needed = 64 - this.bufferLength;
      if (len < needed) {
        this.buffer.set(data.subarray(offset, offset + len), this.bufferLength);
        this.bufferLength += len;
        return this;
      }

      this.buffer.set(data.subarray(offset, offset + needed), this.bufferLength);
      this.processBlock(this.buffer);
      this.bufferLength = 0;
      offset += needed;
      len -= needed;
    }
    return this;
  }

  /**
   * Finalizes the hash and returns the hex string.
   */
  public hex(): string {
    const finalBuffer = new Uint8Array(this.buffer.subarray(0, this.bufferLength));
    const totalBits = this.totalLength * 8;
    
    // Padding: 1 bit (0x80) followed by 0 bits
    const paddingLength = (this.bufferLength < 56) 
      ? 56 - this.bufferLength 
      : 64 + 56 - this.bufferLength;
      
    const padding = new Uint8Array(paddingLength + 8);
    padding[0] = 0x80;
    
    // Append length in bits as big-endian 64-bit integer
    const high = Math.floor(totalBits / 0x100000000);
    const low = totalBits >>> 0;
    
    const view = new DataView(padding.buffer);
    view.setUint32(paddingLength, high, false); // Big-endian
    view.setUint32(paddingLength + 4, low, false); // Big-endian

    // Process final block(s)
    this.update(padding);
    
    // Reset totalLength because update() incremented it with padding
    // (though strictly not needed as we are done)

    return Array.from(this.h)
      .map(x => x.toString(16).padStart(8, '0'))
      .join('');
  }

  private processBlock(block: Uint8Array): void {
    const w = new Uint32Array(64);
    const view = new DataView(block.buffer, block.byteOffset, block.byteLength);

    for (let i = 0; i < 16; i++) {
      w[i] = view.getUint32(i * 4, false); // Big-endian
    }

    for (let i = 16; i < 64; i++) {
      const s0 = this.rotr(w[i - 15], 7) ^ this.rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = this.rotr(w[i - 2], 17) ^ this.rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }

    let [a, b, c, d, e, f, g, h] = this.h;

    for (let i = 0; i < 64; i++) {
      const S1 = this.rotr(e, 6) ^ this.rotr(e, 11) ^ this.rotr(e, 25);
      const ch = (e & f) ^ ((~e) & g);
      const temp1 = (h + S1 + ch + SHA256.K[i] + w[i]) >>> 0;
      const S0 = this.rotr(a, 2) ^ this.rotr(a, 13) ^ this.rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    this.h[0] = (this.h[0] + a) >>> 0;
    this.h[1] = (this.h[1] + b) >>> 0;
    this.h[2] = (this.h[2] + c) >>> 0;
    this.h[3] = (this.h[3] + d) >>> 0;
    this.h[4] = (this.h[4] + e) >>> 0;
    this.h[5] = (this.h[5] + f) >>> 0;
    this.h[6] = (this.h[6] + g) >>> 0;
    this.h[7] = (this.h[7] + h) >>> 0;
  }

  private rotr(x: number, n: number): number {
    return (x >>> n) | (x << (32 - n));
  }
}

/**
 * Helper to hash a File using streams
 */
export async function hashFile(
  file: File, 
  onProgress?: (progress: number) => void
): Promise<string> {
  const sha256 = new SHA256();
  const chunkSize = 1024 * 1024; // 1MB chunks
  const total = file.size;
  let offset = 0;

  // Small file optimization? No, always stream for consistency
  
  while (offset < total) {
    const slice = file.slice(offset, offset + chunkSize);
    const buffer = await slice.arrayBuffer();
    sha256.update(buffer);
    
    offset += buffer.byteLength;
    if (onProgress) {
      onProgress(Math.min(100, (offset / total) * 100));
    }
    
    // Allow UI to update
    await new Promise(resolve => setTimeout(resolve, 0));
  }

  return sha256.hex();
}
