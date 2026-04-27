import React from 'react'
import { Box, Text } from 'ink'
import { PreviewContent, FileEntry } from '../types'
import { formatSize, formatDate, formatPermissions } from '../lib/formatters'

type Props = {
  entry: FileEntry | null
  preview: PreviewContent
}

function Loading() {
  return <Text dimColor>loading…</Text>
}

function DirPreview({ preview }: { preview: Extract<PreviewContent, { kind: 'dir' }> }) {
  return (
    <Box flexDirection="column">
      <Text bold>{preview.count} items · {formatSize(preview.totalSize)}</Text>
      <Text> </Text>
      {preview.items.map((name) => (
        <Text key={name} color={name.endsWith('/') ? 'blue' : undefined}>{name}</Text>
      ))}
    </Box>
  )
}

function MetaPreview({ preview, entry }: { preview: Extract<PreviewContent, { kind: 'meta' }>; entry: FileEntry }) {
  const { stat, mime } = preview
  return (
    <Box flexDirection="column" gap={0}>
      <Text><Text bold>Name:  </Text>{entry.name}</Text>
      <Text><Text bold>Size:  </Text>{formatSize(stat.size)}</Text>
      <Text><Text bold>Type:  </Text>{mime}</Text>
      <Text><Text bold>Perms: </Text>{formatPermissions(stat.mode)}</Text>
      <Text><Text bold>Mod:   </Text>{formatDate(stat.mtime)}</Text>
      <Text><Text bold>Born:  </Text>{formatDate(stat.birthtime)}</Text>
    </Box>
  )
}

function TextPreview({ preview }: { preview: Extract<PreviewContent, { kind: 'text' }> }) {
  return (
    <Box flexDirection="column" overflow="hidden">
      {preview.lines.map((line, i) => (
        <Box key={i}>
          <Text dimColor>{String(i + 1).padStart(3, ' ')} </Text>
          <Text>{line}</Text>
        </Box>
      ))}
    </Box>
  )
}

function ImagePreview({ preview }: { preview: Extract<PreviewContent, { kind: 'image' }> }) {
  return (
    <Box flexDirection="column">
      {preview.ascii.split('\n').map((line, i) => (
        <Text key={i}>{line}</Text>
      ))}
    </Box>
  )
}

export function PreviewPanel({ entry, preview }: Props) {
  const title = entry ? entry.name : 'preview'

  return (
    <Box
      flexDirection="column"
      borderStyle="single"
      paddingX={1}
      flexGrow={2}
      overflow="hidden"
    >
      <Text bold color="cyan">{title}</Text>
      <Text> </Text>
      {preview.kind === 'loading' && <Loading />}
      {preview.kind === 'empty' && <Text dimColor>nothing to preview</Text>}
      {preview.kind === 'text' && <TextPreview preview={preview} />}
      {preview.kind === 'dir' && <DirPreview preview={preview} />}
      {preview.kind === 'meta' && entry && <MetaPreview preview={preview} entry={entry} />}
      {preview.kind === 'image' && <ImagePreview preview={preview} />}
    </Box>
  )
}
