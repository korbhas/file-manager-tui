import React, { useState, useMemo } from 'react'
import { Box, Text, useApp, useInput, useStdout, Key } from 'ink'
import { FileEntry, OpMode } from './types'
import { useFileTree } from './hooks/useFileTree'
import { useFuzzySearch } from './hooks/useFuzzySearch'
import { useGitStatus } from './hooks/useGitStatus'
import { usePreview } from './hooks/usePreview'
import { SearchBar } from './components/SearchBar'
import { ResultsList } from './components/ResultsList'
import { PreviewPanel } from './components/PreviewPanel'
import { StatusBar } from './components/StatusBar'
import { OpModal } from './components/OpModal'
import { openFile, renameEntry, copyEntry, moveEntry } from './lib/fileOps'

const ROOT = process.cwd()

export function App() {
  const { exit } = useApp()
  const { stdout } = useStdout()
  const termHeight = stdout?.rows ?? 24
  const termWidth = stdout?.columns ?? 80

  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [mode, setMode] = useState<OpMode>('search')
  const [opTarget, setOpTarget] = useState<FileEntry | null>(null)
  const [opValue, setOpValue] = useState('')
  const [opError, setOpError] = useState('')

  const { files, loading, refresh: refreshFiles } = useFileTree(ROOT)
  const { statusMap, refresh: refreshGit } = useGitStatus(ROOT)

  const filesWithGit = useMemo(
    () => files.map((f) => ({ ...f, gitStatus: statusMap.get(f.absPath) })),
    [files, statusMap]
  )

  const results = useFuzzySearch(filesWithGit, query)

  const clampedIndex = Math.min(selectedIndex, Math.max(0, results.length - 1))
  const selectedEntry = results[clampedIndex] ?? null

  const listHeight = termHeight - 4
  const previewCols = Math.floor(termWidth * 0.55)
  const preview = usePreview(selectedEntry, previewCols)

  // keep selectedIndex in range when results shrink
  const safeIndex = results.length === 0 ? 0 : Math.min(selectedIndex, results.length - 1)

  useInput((input: string, key: Key) => {
    // Esc always dismisses an active op modal
    if (key.escape) {
      if (mode !== 'search') handleOpCancel()
      return
    }

    if (mode !== 'search') return

    if (key.upArrow || input === 'k') {
      setSelectedIndex((i) => Math.max(0, i - 1))
    } else if (key.downArrow || input === 'j') {
      setSelectedIndex((i) => Math.min(results.length - 1, i + 1))
    } else if (key.return) {
      if (selectedEntry) {
        openFile(selectedEntry.absPath).catch(() => {})
      }
    } else if (input === 'q' && !query) {
      exit()
    } else if (key.ctrl && input === 'r') {
      if (selectedEntry) {
        setOpTarget(selectedEntry)
        setOpValue(selectedEntry.name)
        setOpError('')
        setMode('rename')
      }
    } else if (key.ctrl && input === 'y') {
      if (selectedEntry) {
        setOpTarget(selectedEntry)
        setOpValue('')
        setOpError('')
        setMode('copy')
      }
    } else if (key.ctrl && input === 'm') {
      if (selectedEntry) {
        setOpTarget(selectedEntry)
        setOpValue('')
        setOpError('')
        setMode('move')
      }
    }
  })

  const handleOpConfirm = async () => {
    if (!opTarget || !opValue.trim()) return
    try {
      if (mode === 'rename') {
        await renameEntry(opTarget.absPath, opValue.trim())
      } else if (mode === 'copy') {
        await copyEntry(opTarget.absPath, opValue.trim())
      } else if (mode === 'move') {
        await moveEntry(opTarget.absPath, opValue.trim())
      }
      await refreshFiles()
      refreshGit()
      setMode('search')
      setOpTarget(null)
      setOpValue('')
      setOpError('')
    } catch (err) {
      setOpError(err instanceof Error ? err.message : String(err))
    }
  }

  const handleOpCancel = () => {
    setMode('search')
    setOpTarget(null)
    setOpValue('')
    setOpError('')
  }

  return (
    <Box flexDirection="column" height={termHeight}>
      <SearchBar
        query={query}
        onChange={(v) => { setQuery(v); setSelectedIndex(0) }}
        resultCount={results.length}
        totalCount={files.length}
        loading={loading}
      />

      <Box flexGrow={1} overflow="hidden">
        <Box flexDirection="column" width="40%" overflow="hidden">
          <ResultsList
            results={results}
            selectedIndex={safeIndex}
            height={listHeight}
          />
        </Box>
        <Box flexDirection="column" width="60%" overflow="hidden">
          <PreviewPanel entry={selectedEntry} preview={preview} />
        </Box>
      </Box>

      <StatusBar
        rootDir={ROOT}
        mode={mode}
        selectedPath={selectedEntry?.absPath ?? null}
      />

      {mode !== 'search' && opTarget && (
        <Box
          position="absolute"
          marginTop={Math.floor(termHeight / 2) - 4}
          marginLeft={Math.floor(termWidth * 0.1)}
          width="80%"
        >
          <OpModal
            mode={mode}
            target={opTarget}
            value={opValue}
            onChange={setOpValue}
            onConfirm={handleOpConfirm}
            onCancel={handleOpCancel}
            error={opError}
          />
        </Box>
      )}

      {loading && files.length === 0 && (
        <Box justifyContent="center">
          <Text color="cyan">scanning files…</Text>
        </Box>
      )}
    </Box>
  )
}
