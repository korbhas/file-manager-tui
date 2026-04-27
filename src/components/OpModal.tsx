import React from 'react'
import { Box, Text } from 'ink'
import TextInput from 'ink-text-input'
import { OpMode, FileEntry } from '../types'

type Props = {
  mode: Exclude<OpMode, 'search'>
  target: FileEntry
  value: string
  onChange: (v: string) => void
  onConfirm: () => void
  onCancel: () => void
  error?: string
}

const LABEL: Record<Exclude<OpMode, 'search'>, string> = {
  rename: 'New name:',
  copy: 'Copy to directory:',
  move: 'Move to directory:',
}

export function OpModal({ mode, target, value, onChange, onConfirm, onCancel, error }: Props) {
  return (
    <Box
      flexDirection="column"
      borderStyle="double"
      borderColor="cyan"
      paddingX={2}
      paddingY={1}
      marginX={4}
    >
      <Text bold color="cyan">
        {mode.toUpperCase()}: {target.relPath}
      </Text>
      <Text> </Text>
      <Box>
        <Text color="yellow">{LABEL[mode]} </Text>
        <TextInput
          value={value}
          onChange={onChange}
          onSubmit={onConfirm}
        />
      </Box>
      {error && <Text color="red">{error}</Text>}
      <Text> </Text>
      <Text dimColor>enter confirm  esc cancel</Text>
    </Box>
  )
}
