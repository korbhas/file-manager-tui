import { useMemo } from 'react'
import fuzzysort from 'fuzzysort'
import { FileEntry } from '../types'

export function useFuzzySearch(files: FileEntry[], query: string): FileEntry[] {
  return useMemo(() => {
    if (!query.trim()) return files
    const results = fuzzysort.go(query, files, { key: 'relPath', limit: 200, threshold: -10000 })
    return results.map((r) => r.obj)
  }, [files, query])
}
