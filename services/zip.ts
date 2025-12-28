
/**
 * A lightweight utility to create uncompressed ZIP files in-memory.
 */
export class ZipBuilder {
  private entries: { name: string; data: Uint8Array; crc: number }[] = [];

  // Simple CRC32 implementation
  private static crc32(data: Uint8Array): number {
    let crc = 0xffffffff;
    for (let i = 0; i < data.length; i++) {
      let byte = data[i];
      crc ^= byte;
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
      }
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  addFile(name: string, data: Uint8Array) {
    this.entries.push({
      name,
      data,
      crc: ZipBuilder.crc32(data),
    });
  }

  build(): Uint8Array {
    let totalSize = 0;
    const localHeaders: Uint8Array[] = [];
    const centralDirectoryHeaders: Uint8Array[] = [];
    const offsets: number[] = [];

    const encoder = new TextEncoder();

    // 1. Create Local File Headers and Data
    for (const entry of this.entries) {
      offsets.push(totalSize);
      const nameBytes = encoder.encode(entry.name);
      
      const header = new Uint8Array(30 + nameBytes.length);
      const view = new DataView(header.buffer);
      
      view.setUint32(0, 0x04034b50, true); // Signature
      view.setUint16(4, 20, true);         // Version
      view.setUint16(6, 0, true);          // Flags
      view.setUint16(8, 0, true);          // Compression (Store)
      view.setUint16(10, 0, true);         // Mod Time
      view.setUint16(12, 0, true);         // Mod Date
      view.setUint32(14, entry.crc, true); // CRC32
      view.setUint32(18, entry.data.length, true); // Comp Size
      view.setUint32(22, entry.data.length, true); // Uncomp Size
      view.setUint16(26, nameBytes.length, true);  // Name length
      view.setUint16(28, 0, true);         // Extra length
      header.set(nameBytes, 30);
      
      localHeaders.push(header);
      totalSize += header.length + entry.data.length;
    }

    const localDataSize = totalSize;

    // 2. Create Central Directory Headers
    let cdSize = 0;
    for (let i = 0; i < this.entries.length; i++) {
      const entry = this.entries[i];
      const nameBytes = encoder.encode(entry.name);
      const header = new Uint8Array(46 + nameBytes.length);
      const view = new DataView(header.buffer);
      
      view.setUint32(0, 0x02014b50, true); // Signature
      view.setUint16(4, 20, true);         // Version made by
      view.setUint16(6, 20, true);         // Version needed
      view.setUint16(8, 0, true);          // Flags
      view.setUint16(10, 0, true);         // Compression
      view.setUint16(12, 0, true);         // Time
      view.setUint16(14, 0, true);         // Date
      view.setUint32(16, entry.crc, true); // CRC32
      view.setUint32(20, entry.data.length, true); // Comp Size
      view.setUint32(24, entry.data.length, true); // Uncomp Size
      view.setUint16(28, nameBytes.length, true);  // Name length
      view.setUint16(30, 0, true);         // Extra length
      view.setUint16(32, 0, true);         // Comment length
      view.setUint16(34, 0, true);         // Disk number
      view.setUint16(36, 0, true);         // Internal attr
      view.setUint32(38, 0, true);         // External attr
      view.setUint32(42, offsets[i], true); // Offset of local header
      header.set(nameBytes, 46);
      
      centralDirectoryHeaders.push(header);
      cdSize += header.length;
    }

    // 3. Create EOCD
    const eocd = new Uint8Array(22);
    const eocdView = new DataView(eocd.buffer);
    eocdView.setUint32(0, 0x06054b50, true);
    eocdView.setUint16(4, 0, true);
    eocdView.setUint16(6, 0, true);
    eocdView.setUint16(8, this.entries.length, true); // Entries on disk
    eocdView.setUint16(10, this.entries.length, true); // Total entries
    eocdView.setUint32(12, cdSize, true);
    eocdView.setUint32(16, localDataSize, true);
    eocdView.setUint16(20, 0, true);

    // 4. Combine all
    const result = new Uint8Array(localDataSize + cdSize + eocd.length);
    let currentOffset = 0;
    for (let i = 0; i < this.entries.length; i++) {
      result.set(localHeaders[i], currentOffset);
      currentOffset += localHeaders[i].length;
      result.set(this.entries[i].data, currentOffset);
      currentOffset += this.entries[i].data.length;
    }
    for (const cdHeader of centralDirectoryHeaders) {
      result.set(cdHeader, currentOffset);
      currentOffset += cdHeader.length;
    }
    result.set(eocd, currentOffset);

    return result;
  }
}
