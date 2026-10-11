// Looks for secrets in what is sent to browsers: node scripts/check-secrets.mjs   (run after `pnpm build`)
//   pnpm check:secrets
// Reads the secret values from .env and searches .next/static (the JavaScript and CSS every visitor downloads)
// and the pre-rendered HTML pages. A match means a secret would be visible to the public. Exit code 1 if found.
import fs from 'node:fs'
import path from 'node:path'

const SECRET_NAMES = /^(PAYLOAD_SECRET|DATABASE_URL|GROQ_API_KEY|SMTP_PASS|SMTP_USER|TURNSTILE_SECRET|LEAD_NOTIFY_TO)$/
const GENERIC = [/gsk_[A-Za-z0-9]{20,}/, /postgres(ql)?:\/\/[^\s"']+:[^\s"']+@/, /-----BEGIN [A-Z ]*PRIVATE KEY-----/, /sk-[A-Za-z0-9]{32,}/]

const values = new Map()
if (fs.existsSync('.env')) {
  for (const line of fs.readFileSync('.env', 'utf8').split(/\r?\n/)) {
    const match = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim())
    const value = match?.[2].replace(/^["']|["']$/g, '')
    // Short or placeholder values would match by accident.
    if (match && SECRET_NAMES.test(match[1]) && value && value.length >= 8 && !/^your-/i.test(value)) values.set(match[1], value)
  }
}

const walk = (dir) =>
  fs.existsSync(dir)
    ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(dir, entry.name)
        return entry.isDirectory() ? walk(full) : [full]
      })
    : []

const files = [...walk('.next/static'), ...walk('.next/server/app').filter((file) => file.endsWith('.html'))]
console.log(`Checking ${files.length} public files against ${values.size} secret value(s) from .env`)
let found = 0
for (const file of files) {
  if (!/\.(js|css|html|json|txt|map)$/.test(file)) continue
  const text = fs.readFileSync(file, 'utf8')
  for (const [name, value] of values) {
    if (text.includes(value)) {
      found += 1
      console.log(`FOUND ${name} in ${file}`)
    }
  }
  for (const pattern of GENERIC) {
    if (pattern.test(text)) {
      found += 1
      console.log(`FOUND pattern ${pattern} in ${file}`)
    }
  }
}
console.log(found ? `\n${found} secret(s) exposed!` : 'No secrets found in client bundles or pre-rendered pages.')
process.exit(found ? 1 : 0)
