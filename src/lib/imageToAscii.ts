import { Jimp } from 'jimp'

const CHARS = ' .,:;i1tfLCG08@'

export async function imageToAscii(absPath: string, cols = 40): Promise<string> {
  const img = await Jimp.read(absPath)
  const aspectCorrection = 0.45
  const rows = Math.round((img.height / img.width) * cols * aspectCorrection)
  img.resize({ w: cols, h: rows })
  img.greyscale()

  const lines: string[] = []
  for (let y = 0; y < rows; y++) {
    let line = ''
    for (let x = 0; x < cols; x++) {
      const pixel = img.getPixelColor(x, y)
      const r = (pixel >> 24) & 0xff
      const charIdx = Math.floor((r / 255) * (CHARS.length - 1))
      line += CHARS[charIdx]
    }
    lines.push(line)
  }
  return lines.join('\n')
}
