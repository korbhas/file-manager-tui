import React from 'react'
import { Box, Text } from 'ink'
import { FileEntry } from '../types'

const MARKER_COLOR: Record<string, string> = {
  M: 'yellow',
  A: 'green',
  '?': 'gray',
  D: 'red',
}

type Props = {
  results: FileEntry[]
  selectedIndex: number
  height: number
}

export function ResultsList({ results, selectedIndex, height }: Props) {
  const visibleCount = Math.max(1, height - 2)
  const half = Math.floor(visibleCount / 2)
  const start = Math.max(0, Math.min(selectedIndex - half, results.length - visibleCount))
  const visible = results.slice(start, start + visibleCount)

  if (results.length === 0) {
    return (
      <Box flexGrow={1} flexDirection="column" borderStyle="single" paddingX={1}>
        <Text dimColor>no matches</Text>
      </Box>
    )
  }

  return (
    <Box flexGrow={1} flexDirection="column" borderStyle="single" paddingX={1} overflow="hidden">
      {visible.map((entry, i) => {
        const realIndex = start + i
        const isSelected = realIndex === selectedIndex
        const marker = entry.gitStatus

        return (
          <Box key={entry.absPath}>
            <Text color={isSelected ? 'cyan' : undefined} bold={isSelected}>
              {isSelected ? '▶ ' : '  '}
            </Text>
            {marker && (
              <Text color={MARKER_COLOR[marker] ?? 'white'}>{marker} </Text>
            )}
            {entry.isDir ? (
              <Text color={isSelected ? 'cyan' : 'blue'} bold>
                {entry.relPath}/
              </Text>
            ) : (
              <Text color={isSelected ? 'cyan' : undefined}>{entry.relPath}</Text>
            )}
          </Box>
        )
      })}
    </Box>
  )
}
