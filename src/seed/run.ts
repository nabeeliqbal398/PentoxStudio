import { getPayload } from 'payload'

import config from '../payload.config'
import { seed } from './index'

// Run with `pnpm seed`. Safe to re-run: existing docs are never overwritten or duplicated.
const payload = await getPayload({ config })

try {
  await seed(payload)
  process.exit(0)
} catch (error) {
  payload.logger.error(error)
  process.exit(1)
}
