import React from 'react'
import { Box, Text } from 'ink'
import TextInput from 'ink-text-input'

type Props = {
  query: string
  onChange: (value: string) => void
  resultCount: number
  totalCount: number
  loading: boolean
}

export function SearchBar({ query, onChange, resultCount, totalCount, loading }: Props) {
  const counter = loading ? 'scanning…' : `${resultCount} / ${totalCount}`

  return (
    <Box borderStyle="single" paddingX={1}>
      <Text color="cyan" bold>{'> '}</Text>
      <Box flexGrow={1}>
        <TextInput value={query} onChange={onChange} placeholder="fuzzy search files…" />
      </Box>
      <Text dimColor>{counter}</Text>
    </Box>
  )
}
