import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import * as os from 'os'
import * as fs from 'fs/promises'
import * as path from 'path'

import { formatSize, formatDate, formatPermissions, mimeFromExt } from '../lib/formatters.js'
import { parseGitStatus } from '../hooks/useGitStatus.js'
import { renameEntry, copyEntry, moveEntry } from '../lib/fileOps.js'

// ── formatters ────────────────────────────────────────────────────────────────

describe('formatSize', () => {
  test('bytes', () => assert.equal(formatSize(512), '512 B'))
  test('kilobytes', () => assert.equal(formatSize(1536), '1.5 KB'))
  test('megabytes', () => assert.equal(formatSize(2.5 * 1024 * 1024), '2.5 MB'))
  test('gigabytes', () => assert.equal(formatSize(1.2 * 1024 ** 3), '1.2 GB'))
  test('zero', () => assert.equal(formatSize(0), '0 B'))
})

describe('formatPermissions', () => {
  test('rwxr-xr-x (0o755)', () => assert.equal(formatPermissions(0o755), 'rwxr-xr-x'))
  test('rw-r--r-- (0o644)', () => assert.equal(formatPermissions(0o644), 'rw-r--r--'))
  test('rwx------ (0o700)', () => assert.equal(formatPermissions(0o700), 'rwx------'))
  test('--------- (0o000)', () => assert.equal(formatPermissions(0o000), '---------'))
})

describe('mimeFromExt', () => {
  test('.ts → text/typescript', () => assert.equal(mimeFromExt('.ts'), 'text/typescript'))
  test('.png → image/png', () => assert.equal(mimeFromExt('.png'), 'image/png'))
  test('.json → application/json', () => assert.equal(mimeFromExt('.json'), 'application/json'))
  test('unknown → application/octet-stream', () => assert.equal(mimeFromExt('.xyz'), 'application/octet-stream'))
  test('case-insensitive', () => assert.equal(mimeFromExt('.PNG'), 'image/png'))
})

describe('formatDate', () => {
  test('today', () => {
    assert.equal(formatDate(new Date()), 'today')
  })
  test('yesterday', () => {
    const d = new Date(Date.now() - 86_400_000)
    assert.equal(formatDate(d), 'yesterday')
  })
  test('3 days ago', () => {
    const d = new Date(Date.now() - 3 * 86_400_000)
    assert.equal(formatDate(d), '3d ago')
  })
})

// ── git status parser ─────────────────────────────────────────────────────────

describe('parseGitStatus', () => {
  const root = '/repo'

  test('modified file', () => {
    const map = parseGitStatus(' M src/App.tsx\n', root)
    assert.equal(map.get('/repo/src/App.tsx'), 'M')
  })

  test('added file', () => {
    const map = parseGitStatus('A  src/new.ts\n', root)
    assert.equal(map.get('/repo/src/new.ts'), 'A')
  })

  test('untracked file', () => {
    const map = parseGitStatus('?? notes.txt\n', root)
    assert.equal(map.get('/repo/notes.txt'), '?')
  })

  test('deleted file', () => {
    const map = parseGitStatus(' D old.ts\n', root)
    assert.equal(map.get('/repo/old.ts'), 'D')
  })

  test('multiple entries', () => {
    const output = ' M a.ts\n?? b.ts\nA  c.ts\n'
    const map = parseGitStatus(output, root)
    assert.equal(map.size, 3)
    assert.equal(map.get('/repo/a.ts'), 'M')
    assert.equal(map.get('/repo/b.ts'), '?')
    assert.equal(map.get('/repo/c.ts'), 'A')
  })

  test('empty output → empty map', () => {
    const map = parseGitStatus('', root)
    assert.equal(map.size, 0)
  })
})

// ── file operations ───────────────────────────────────────────────────────────

describe('fileOps', () => {
  let tmpDir: string

  test('setup tmpDir', async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tui-test-'))
  })

  test('renameEntry renames a file', async () => {
    const src = path.join(tmpDir, 'original.txt')
    await fs.writeFile(src, 'hello')
    const dest = await renameEntry(src, 'renamed.txt')
    assert.equal(path.basename(dest), 'renamed.txt')
    await assert.doesNotReject(fs.access(dest))
    await assert.rejects(fs.access(src))
  })

  test('copyEntry copies a file', async () => {
    const src = path.join(tmpDir, 'source.txt')
    await fs.writeFile(src, 'copy me')
    const destDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tui-copy-'))
    await copyEntry(src, destDir)
    const copied = path.join(destDir, 'source.txt')
    const content = await fs.readFile(copied, 'utf8')
    assert.equal(content, 'copy me')
    await fs.rm(destDir, { recursive: true })
  })

  test('moveEntry moves a file', async () => {
    const src = path.join(tmpDir, 'tomove.txt')
    await fs.writeFile(src, 'move me')
    const destDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tui-move-'))
    await moveEntry(src, destDir)
    const moved = path.join(destDir, 'tomove.txt')
    await assert.doesNotReject(fs.access(moved))
    await assert.rejects(fs.access(src))
    await fs.rm(destDir, { recursive: true })
  })

  test('renameEntry rejects on non-existent file', async () => {
    await assert.rejects(renameEntry(path.join(tmpDir, 'ghost.txt'), 'new.txt'))
  })

  test('cleanup tmpDir', async () => {
    await fs.rm(tmpDir, { recursive: true, force: true })
  })
})
