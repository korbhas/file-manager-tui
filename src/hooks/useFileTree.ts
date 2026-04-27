import { useState, useEffect, useCallback } from 'react'
import * as fs from 'fs/promises'
import * as path from 'path'
import { FileEntry, SKIP_DIRS } from '../types'

async function walk(dir: string, rootDir: string, entries: FileEntry[]): Promise<void> {
  let children: import('fs').Dirent<string>[]
  try {
    children = await fs.readdir(dir, { withFileTypes: true, encoding: 'utf8' }) as import('fs').Dirent<string>[]
  } catch {
    return
  }

  for (const child of children) {
    if (SKIP_DIRS.has(child.name)) continue

    const absPath = path.join(dir, child.name)
    const relPath = path.relative(rootDir, absPath)
    const isDir = child.isDirectory()

    let size = 0
    let mtime = new Date(0)
    try {
      const stat = await fs.stat(absPath)
      size = stat.size
      mtime = stat.mtime
    } catch {
      // skip unreadable
    }

    entries.push({
      absPath,
      relPath,
      name: child.name,
      isDir,
      ext: isDir ? '' : path.extname(child.name).toLowerCase(),
      size,
      mtime,
    })

    if (isDir) {
      await walk(absPath, rootDir, entries)
    }
  }
}

export function useFileTree(rootDir: string) {
  const [files, setFiles] = useState<FileEntry[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    const entries: FileEntry[] = []
    await walk(rootDir, rootDir, entries)
    entries.sort((a, b) => b.mtime.getTime() - a.mtime.getTime())
    setFiles(entries)
    setLoading(false)
  }, [rootDir])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { files, loading, refresh }
}
