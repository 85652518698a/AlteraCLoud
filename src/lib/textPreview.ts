const TEXT_EXTENSIONS = new Set([
  'txt', 'md', 'markdown', 'py', 'js', 'ts', 'jsx', 'tsx',
  'css', 'scss', 'sass', 'less', 'html', 'htm', 'json', 'xml',
  'yaml', 'yml', 'toml', 'ini', 'cfg', 'conf', 'log', 'csv',
  'env', 'sql', 'sh', 'bash', 'zsh', 'bat', 'cmd', 'ps1',
  'dockerfile', 'gitignore', 'editorconfig', 'makefile', 'cmake',
  'h', 'c', 'cpp', 'cxx', 'cc', 'hpp', 'hxx', 'java', 'rb',
  'go', 'rs', 'swift', 'kt', 'kts', 'dart', 'php', 'r', 'rdata',
  'pl', 'pm', 'lua', 'scala', 'clj', 'cljs', 'edn',
  'gradle', 'groovy', 'vue', 'svelte', 'astro', 'mjs', 'cjs',
  'tsbuildinfo', 'map', 'prisma', 'graphql', 'gql', 'proto',
  'wgsl', 'glsl', 'frag', 'vert', 'sln', 'csproj',
])

const EXT_TO_LANG: Record<string, string> = {
  py: 'python', js: 'javascript', ts: 'typescript', jsx: 'javascript',
  tsx: 'typescript', rb: 'ruby', rs: 'rust', go: 'go', java: 'java',
  c: 'c', cpp: 'cpp', h: 'c', hpp: 'cpp', cs: 'csharp',
  php: 'php', swift: 'swift', kt: 'kotlin', dart: 'dart',
  scala: 'scala', lua: 'lua', r: 'r', pl: 'perl', sh: 'bash',
  bash: 'bash', zsh: 'bash', ps1: 'powershell', sql: 'sql',
  html: 'html', htm: 'html', css: 'css', scss: 'scss', less: 'less',
  json: 'json', xml: 'xml', yaml: 'yaml', yml: 'yaml', toml: 'ini',
  ini: 'ini', md: 'markdown', markdown: 'markdown',
  dockerfile: 'dockerfile', makefile: 'makefile', cmake: 'cmake',
  graphql: 'graphql', gql: 'graphql', vue: 'html', svelte: 'html',
  astro: 'html', env: 'ini', gradle: 'groovy', groovy: 'groovy',
  tex: 'latex', bib: 'latex',
}

export function isTextFile(ext: string | undefined | null): boolean {
  if (!ext) return false
  return TEXT_EXTENSIONS.has(ext.toLowerCase())
}

export function getHighlightLanguage(ext: string | undefined | null): string {
  if (!ext) return 'plaintext'
  return EXT_TO_LANG[ext.toLowerCase()] || 'plaintext'
}
