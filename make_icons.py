import struct, zlib

def make_png(size):
    w, h = size, size
    teal = (13, 122, 110)
    white = (255, 255, 255)
    pixels = []
    for y in range(h):
        row = []
        for x in range(w):
            cx, cy = w//2, h//2
            thick = max(w//10, 4)
            if abs(x - cx) < thick or abs(y - cy) < thick:
                row.extend(white)
            else:
                row.extend(teal)
        pixels.append(row)
    def chunk(name, data):
        c = name + data
        return struct.pack('>I', len(data)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)
    raw = b''
    for row in pixels:
        raw += b'\x00' + bytes(row)
    compressed = zlib.compress(raw, 9)
    png = b'\x89PNG\r\n\x1a\n'
    png += chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0))
    png += chunk(b'IDAT', compressed)
    png += chunk(b'IEND', b'')
    return png

for size in [192, 512]:
    data = make_png(size)
    with open(f'/home/dralanhiatt/chiro-practice-mgmt/public/icon-{size}.png', 'wb') as f:
        f.write(data)
    print(f'icon-{size}.png created: {len(data)} bytes')
