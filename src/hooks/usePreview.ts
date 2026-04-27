import { useState, useEffect } from 'react'
import * as fs from 'fs/promises'
import * as path from 'path'
import { FileEntry, PreviewContent, IMAGE_EXTS, TEXT_EXTS } from '../types'
import { formatSize, mimeFromExt } from '../lib/formatters'
import { imageToAscii } from '../lib/imageToAscii'

const MAX_TEXT_BYTES = 512 * 1024

async function loadPreview(entry: FileEntry, cols: number): Promise<PreviewContent> {
  if (entry.isDir) {
    try {
      const children = await fs.readdir(entry.absPath, { withFileTypes: true })
      let totalSize = 0
      const items: string[] = []
      for (const child of children.slice(0, 20)) {
        const childPath = path.join(entry.absPath, child.name)
        try {
          const stat = await fs.stat(childPath)
          totalSize += stat.size
          items.push(child.isDirectory() ? `${child.name}/` : child.name)
        } catch {
          items.push(child.name)
        }
      }
      return { kind: 'dir', items, totalSize, count: children.length }
    } catch {
      return { kind: 'empty' }
    }
  }

  if (IMAGE_EXTS.has(entry.ext)) {
    try {
      const ascii = await imageToAscii(entry.absPath, Math.min(cols, 60))
      return { kind: 'image', ascii }
    } catch {
      // fall through to metadata
    }
  }

  if (TEXT_EXTS.has(entry.ext) || entry.size < MAX_TEXT_BYTES) {
    try {
      const raw = await fs.readFile(entry.absPath, 'utf8')
      const lines = raw.split('\n').slice(0, 40)
      return { kind: 'text', lines }
    } catch {
      // fall through to metadata
    }
  }

  try {
    const stat = await fs.stat(entry.absPath)
    return { kind: 'meta', stat, mime: mimeFromExt(entry.ext) }
  } catch {
    return { kind: 'empty' }
  }
}

export function usePreview(entry: FileEntry | null, previewCols: number) {
  const [preview, setPreview] = useState<PreviewContent>({ kind: 'empty' })

  useEffect(() => {
    if (!entry) {
      setPreview({ kind: 'empty' })
      return
    }
    setPreview({ kind: 'loading' })
    const timer = setTimeout(() => {
      loadPreview(entry, previewCols).then(setPreview).catch(() => setPreview({ kind: 'empty' }))
    }, 80)
    return () => clearTimeout(timer)
  }, [entry?.absPath, previewCols])

  return preview
}
