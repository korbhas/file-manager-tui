export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

export function formatDate(d: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 30) return `${diffDays}d ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatPermissions(mode: number): string {
  const chars = ['---', '--x', '-w-', '-wx', 'r--', 'r-x', 'rw-', 'rwx']
  const owner = chars[(mode >> 6) & 7]
  const group = chars[(mode >> 3) & 7]
  const other = chars[mode & 7]
  return `${owner}${group}${other}`
}

export function mimeFromExt(ext: string): string {
  const map: Record<string, string> = {
    '.ts': 'text/typescript', '.tsx': 'text/typescript', '.js': 'text/javascript',
    '.jsx': 'text/javascript', '.json': 'application/json', '.md': 'text/markdown',
    '.txt': 'text/plain', '.html': 'text/html', '.css': 'text/css',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.gif': 'image/gif', '.webp': 'image/webp', '.bmp': 'image/bmp',
    '.pdf': 'application/pdf', '.zip': 'application/zip',
    '.py': 'text/x-python', '.go': 'text/x-go', '.rs': 'text/x-rust',
    '.sh': 'application/x-sh', '.yaml': 'text/yaml', '.yml': 'text/yaml',
  }
  return map[ext.toLowerCase()] ?? 'application/octet-stream'
}
