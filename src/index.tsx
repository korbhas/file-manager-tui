import React from 'react'
import { render } from 'ink'
import { App } from './App'

const { unmount, waitUntilExit } = render(<App />, {
  exitOnCtrlC: true,
})

waitUntilExit().then(() => {
  process.exit(0)
})
