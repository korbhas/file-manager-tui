import { useState, useEffect, useCallback } from 'react'
import { execSync } from 'child_process'
import * as path from 'path'
import { GitMarker } from '../types'

export function parseGitStatus(output: string, rootDir: string): Map<string, GitMarker> {
  const map = new Map<string, GitMarker>()
  for (const line of output.split('\n')) {
    if (line.length < 3) continue
    const xy = line.slice(0, 2).trim()
    const filePath = line.slice(3).trim()
    const abs = path.resolve(rootDir, filePath)

    let marker: GitMarker = 'M'
    if (xy === '??') marker = '?'
    else if (xy.includes('A')) marker = 'A'
    else if (xy.includes('D')) marker = 'D'
    else marker = 'M'

    map.set(abs, marker)
  }
  return map
}

export function useGitStatus(rootDir: string) {
  const [statusMap, setStatusMap] = useState<Map<string, GitMarker>>(new Map())

  const refresh = useCallback(() => {
    try {
      const output = execSync('git status --porcelain', {
        cwd: rootDir,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      })
      setStatusMap(parseGitStatus(output, rootDir))
    } catch {
      setStatusMap(new Map())
    }
  }, [rootDir])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { statusMap, refresh }
}
