import { readFile, writeFile } from 'node:fs/promises'

const sourcePath = new URL('./public/models/gift_loot_box_thing_wip.glb', import.meta.url)
const outputPath = new URL('./public/models/gift-loot-box-optimized.glb', import.meta.url)
const source = await readFile(sourcePath)
const jsonLength = source.readUInt32LE(12)
const json = JSON.parse(source.toString('utf8', 20, 20 + jsonLength).trim())
const binaryHeaderOffset = 20 + jsonLength
const binaryLength = source.readUInt32LE(binaryHeaderOffset)
const binaryOffset = binaryHeaderOffset + 8
const usedBinaryLength = json.bufferViews.reduce(
  (maximum, view) => Math.max(maximum, (view.byteOffset ?? 0) + view.byteLength),
  0,
)
json.buffers[0].byteLength = usedBinaryLength

const jsonBytes = Buffer.from(JSON.stringify(json))
const paddedJsonLength = Math.ceil(jsonBytes.length / 4) * 4
const paddedBinaryLength = Math.ceil(usedBinaryLength / 4) * 4
const output = Buffer.alloc(12 + 8 + paddedJsonLength + 8 + paddedBinaryLength)
output.writeUInt32LE(0x46546c67, 0)
output.writeUInt32LE(2, 4)
output.writeUInt32LE(output.length, 8)
output.writeUInt32LE(paddedJsonLength, 12)
output.writeUInt32LE(0x4e4f534a, 16)
jsonBytes.copy(output, 20)
output.fill(0x20, 20 + jsonBytes.length, 20 + paddedJsonLength)
const outputBinaryHeader = 20 + paddedJsonLength
output.writeUInt32LE(paddedBinaryLength, outputBinaryHeader)
output.writeUInt32LE(0x004e4942, outputBinaryHeader + 4)
source.copy(output, outputBinaryHeader + 8, binaryOffset, binaryOffset + Math.min(binaryLength, usedBinaryLength))

await writeFile(outputPath, output)
