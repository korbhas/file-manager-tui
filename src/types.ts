import type * as fs from 'fs'

export type GitMarker = 'M' | 'A' | '?' | 'D'

export type FileEntry = {
  absPath: string
  relPath: string
  name: string
  isDir: boolean
  ext: string
  size: number
  mtime: Date
  gitStatus?: GitMarker
}

export type PreviewContent =
  | { kind: 'text'; lines: string[] }
  | { kind: 'dir'; items: string[]; totalSize: number; count: number }
  | { kind: 'meta'; stat: fs.Stats; mime: string }
  | { kind: 'image'; ascii: string }
  | { kind: 'loading' }
  | { kind: 'empty' }

export type OpMode = 'search' | 'copy' | 'move' | 'rename'

export const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'])
export const TEXT_EXTS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.txt', '.yaml', '.yml',
  '.toml', '.sh', '.bash', '.zsh', '.env', '.gitignore', '.css', '.html',
  '.xml', '.csv', '.rs', '.go', '.py', '.rb', '.c', '.cpp', '.h', '.java',
])

export const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', '.next', '__pycache__', '.cache'])
