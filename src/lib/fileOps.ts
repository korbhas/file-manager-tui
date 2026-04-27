import * as fs from 'fs/promises'
import * as fse from 'fs-extra'
import * as path from 'path'
import { spawn } from 'child_process'

export async function openFile(absPath: string): Promise<void> {
  const editor = process.env.EDITOR ?? process.env.VISUAL ?? 'vi'
  await new Promise<void>((resolve, reject) => {
    const child = spawn(editor, [absPath], { stdio: 'inherit' })
    child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`Editor exited with code ${code}`))))
    child.on('error', reject)
  })
}

export async function renameEntry(absPath: string, newName: string): Promise<string> {
  const dir = path.dirname(absPath)
  const dest = path.join(dir, newName)
  await fs.rename(absPath, dest)
  return dest
}

export async function copyEntry(src: string, destDir: string): Promise<string> {
  const name = path.basename(src)
  const dest = path.join(destDir, name)
  await fse.copy(src, dest)
  return dest
}

export async function moveEntry(src: string, destDir: string): Promise<string> {
  const name = path.basename(src)
  const dest = path.join(destDir, name)
  await fse.move(src, dest, { overwrite: false })
  return dest
}
