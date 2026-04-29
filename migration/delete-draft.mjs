import { createClient } from '@sanity/client'
import readline from 'readline'

// ── Sanity client ──────────────────────────────────────────────────────────────
const token = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_READ_TOKEN
if (!token) {
  console.error('ERROR: No Sanity token found. Set SANITY_WRITE_TOKEN in .env.local')
  process.exit(1)
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token,
})

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const ask = (q) => new Promise(resolve => rl.question(q, answer => resolve(answer.trim())))

// ── Fetch all draft news articles ──────────────────────────────────────────────
async function fetchDrafts() {
  const drafts = await client.fetch(
    `*[_id in path("drafts.**") && _type == "newsArticle"] | order(_updatedAt desc) {
      _id, title, date, tag, _updatedAt
    }`
  )
  return drafts
}

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\nFetching draft news articles from Sanity…\n')

  const drafts = await fetchDrafts()

  if (drafts.length === 0) {
    console.log('No draft news articles found.')
    rl.close()
    return
  }

  console.log('Draft articles:')
  drafts.forEach((d, i) => {
    const updated = new Date(d._updatedAt).toLocaleString('en-IE')
    console.log(`  ${i + 1}. ${d.title ?? '(untitled)'}`)
    console.log(`     ID: ${d._id}`)
    console.log(`     Tag: ${d.tag ?? '—'}  |  Date: ${d.date ?? '—'}  |  Last updated: ${updated}`)
  })

  const answer = await ask(`\nEnter the number of the draft to delete (1–${drafts.length}), or 0 to cancel: `)
  const index = parseInt(answer, 10) - 1

  if (answer === '0' || isNaN(index)) {
    console.log('Cancelled.')
    rl.close()
    return
  }

  if (index < 0 || index >= drafts.length) {
    console.error('Invalid selection.')
    rl.close()
    process.exit(1)
  }

  const target = drafts[index]
  console.log(`\nYou selected: "${target.title ?? '(untitled)'}"`)
  console.log(`ID: ${target._id}`)

  const confirm = await ask('\nAre you sure you want to delete this draft? This cannot be undone. (yes/no): ')
  if (confirm.toLowerCase() !== 'yes') {
    console.log('Cancelled.')
    rl.close()
    return
  }

  try {
    await client.delete(target._id)
    console.log(`\n✅ Draft deleted: ${target._id}`)
  } catch (err) {
    if (err.statusCode === 401 || err.statusCode === 403) {
      console.error('\nERROR: Permission denied. Make sure SANITY_WRITE_TOKEN has Editor permissions.')
    } else {
      console.error('\nERROR:', err.message)
    }
    rl.close()
    process.exit(1)
  }

  rl.close()
}

main().catch(err => {
  console.error('\nFatal error:', err.message)
  rl.close()
  process.exit(1)
})
