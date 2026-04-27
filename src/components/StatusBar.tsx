import React from 'react'
import { Box, Text } from 'ink'
import { OpMode } from '../types'

type Props = {
  rootDir: string
  mode: OpMode
  selectedPath: string | null
}

const HINTS: Record<OpMode, string> = {
  search: '↑/↓ navigate  enter open  ctrl+r rename  ctrl+y copy  ctrl+m move  q quit',
  rename: 'type new name  enter confirm  esc cancel',
  copy:   'type destination dir  enter confirm  esc cancel',
  move:   'type destination dir  enter confirm  esc cancel',
}

export function StatusBar({ rootDir, mode, selectedPath }: Props) {
  const displayPath = selectedPath
    ? selectedPath.replace(rootDir, '~').replace(process.env.HOME ?? '', '~')
    : rootDir.replace(process.env.HOME ?? '', '~')

  return (
    <Box borderStyle="single" paddingX={1} justifyContent="space-between">
      <Text dimColor>{displayPath}</Text>
      <Text dimColor>{HINTS[mode]}</Text>
    </Box>
  )
}
