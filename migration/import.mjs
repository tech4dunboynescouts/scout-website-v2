import axios from 'axios'
import * as cheerio from 'cheerio'
import { createClient } from '@sanity/client'
import fs from 'fs'
import path from 'path'
import { createReadStream } from 'fs'
import { randomBytes } from 'crypto'
import readline from 'readline'

// ── Config ─────────────────────────────────────────────────────────────────────
const IMAGES_DIR = path.resolve('migration/images')

const TAGS = ['Group', 'Beavers', 'Cubs', 'Scouts', 'Ventures', 'Water Section']

async function promptUrl() {
  // Accept URL as a command-line argument: node import.mjs <url>
  const arg = process.argv[2]
  if (arg) {
    try { new URL(arg) } catch {
      console.error('ERROR: Invalid URL provided:', arg)
      process.exit(1)
    }
    return arg
  }
  // Otherwise prompt interactively
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve => {
    rl.question('Enter the WordPress article URL to migrate: ', answer => {
      rl.close()
      const url = answer.trim()
      try { new URL(url) } catch {
        console.error('ERROR: Invalid URL entered.')
        process.exit(1)
      }
      resolve(url)
    })
  })
}

async function promptTag() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve => {
    console.log('\nWhich section should this article be tagged with?')
    TAGS.forEach((t, i) => console.log(`  ${i + 1}. ${t}`))
    rl.question('\nEnter number (1–6): ', answer => {
      rl.close()
      const index = parseInt(answer.trim(), 10) - 1
      if (index >= 0 && index < TAGS.length) {
        resolve(TAGS[index])
      } else {
        console.error('Invalid selection. Please re-run and enter a number between 1 and 6.')
        process.exit(1)
      }
    })
  })
}

// Prefer a dedicated write token; fall back to the read token (may fail with 403)
const token = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_READ_TOKEN
if (!token) {
  console.error('ERROR: No Sanity token found. Set SANITY_WRITE_TOKEN or SANITY_API_READ_TOKEN in .env.local')
  process.exit(1)
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token,
})

const key = () => randomBytes(6).toString('hex')

// ── Helpers ────────────────────────────────────────────────────────────────────
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')   // remove emoji / punctuation
    .trim()
    .replace(/[\s_]+/g, '-')    // spaces → hyphens
    .replace(/-+/g, '-')
    .slice(0, 96)
}

function autoExcerpt(paragraphs) {
  const full = paragraphs.join(' ')
  return full.length <= 300 ? full : full.slice(0, 297) + '…'
}

function toPortableText(paragraphs) {
  return paragraphs.map(text => ({
    _type: 'block',
    _key: key(),
    style: 'normal',
    children: [{ _type: 'span', _key: key(), text, marks: [] }],
    markDefs: [],
  }))
}

// ── Step 2: Scrape ─────────────────────────────────────────────────────────────
async function scrape(articleUrl) {
  console.log('\n[Step 2] Scraping article…')
  const { data: html } = await axios.get(articleUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; migration-script/1.0)' },
    timeout: 15000,
  })
  const $ = cheerio.load(html)

  const title = $('h2.wp-block-post-title').first().text().trim()
  const contentEl = $('div.wp-block-post-content, div.entry-content, article').first()

  const paragraphs = []
  contentEl.find('p').each((_, el) => {
    const text = $(el).text().trim()
    if (text) paragraphs.push(text)
  })

  const dateMatch = paragraphs[0]?.match(
    /^(\d{1,2})(?:st|nd|rd|th)\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/i
  )
  const isoDate = dateMatch
    ? new Date(`${dateMatch[2]} ${dateMatch[1]} ${dateMatch[3]}`).toISOString().split('T')[0]
    : null

  const cleanParagraphs = paragraphs.map((p, i) =>
    i === 0 && dateMatch ? p.replace(/^[^:]+:\s*/, '').trim() : p
  ).filter(Boolean)

  const images = []
  const addImage = src => {
    if (!src) return
    src = src.split('?')[0]
    if (src.includes('wp-content/uploads') && !images.includes(src)) images.push(src)
  }
  contentEl.find('img').each((_, el) => {
    const srcset = $(el).attr('srcset') || ''
    if (srcset) {
      const largest = srcset.split(',').map(s => s.trim().split(/\s+/))
        .sort((a, b) => parseInt(b[1] ?? '0') - parseInt(a[1] ?? '0'))[0]
      addImage(largest?.[0])
    } else {
      addImage($(el).attr('src'))
    }
  })
  contentEl.find('a[href]').each((_, el) => {
    const href = $(el).attr('href') || ''
    if (/\.(jpe?g|png|gif|webp)$/i.test(href)) addImage(href)
  })

  console.log(`  Title:    ${title}`)
  console.log(`  Date:     ${isoDate}`)
  console.log(`  Paras:    ${cleanParagraphs.length}`)
  console.log(`  Images:   ${images.length}`)

  return { title, isoDate, paragraphs: cleanParagraphs, images }
}

// ── Step 3: Download images ────────────────────────────────────────────────────
async function downloadImages(imageUrls) {
  console.log('\n[Step 3] Downloading images…')
  fs.mkdirSync(IMAGES_DIR, { recursive: true })

  const localPaths = []
  for (const url of imageUrls) {
    const filename = path.basename(url)
    const dest = path.join(IMAGES_DIR, filename)

    if (fs.existsSync(dest)) {
      console.log(`  ✓ Already exists: ${filename}`)
      localPaths.push(dest)
      continue
    }

    const response = await axios.get(url, { responseType: 'stream', timeout: 30000 })
    await new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(dest)
      response.data.pipe(writer)
      writer.on('finish', resolve)
      writer.on('error', reject)
    })
    console.log(`  ↓ Downloaded: ${filename}`)
    localPaths.push(dest)
  }
  return localPaths
}

// ── Step 4: Import to Sanity ───────────────────────────────────────────────────
async function importToSanity(title, isoDate, paragraphs, localImagePaths, tag) {
  console.log('\n[Step 4] Importing to Sanity…')

  // 4a — Upload images
  console.log('  Uploading images…')
  const assetIds = []
  for (const filePath of localImagePaths) {
    const filename = path.basename(filePath)
    const ext = path.extname(filename).slice(1).toLowerCase()
    const mimeType = ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : 'image/jpeg'

    let asset
    try {
      asset = await client.assets.upload('image', createReadStream(filePath), {
        filename,
        contentType: mimeType,
      })
    } catch (err) {
      if (err.statusCode === 401 || err.statusCode === 403) {
        console.error('\n  ERROR: Permission denied uploading assets.')
        console.error('  The existing SANITY_API_READ_TOKEN is read-only.')
        console.error('  Create an Editor token in sanity.manage.com and set it as SANITY_WRITE_TOKEN in .env.local, then re-run.\n')
        process.exit(1)
      }
      throw err
    }
    console.log(`  ✓ Uploaded: ${filename} → ${asset._id}`)
    assetIds.push(asset._id)
  }

  // 4b — Build Portable Text body (paragraphs + image gallery)
  const body = toPortableText(paragraphs)

  if (assetIds.length > 0) {
    body.push({
      _type: 'imageGallery',
      _key: key(),
      images: assetIds.map(id => ({
        _type: 'image',
        _key: key(),
        asset: { _type: 'reference', _ref: id },
        alt: title,
      })),
    })
  }

  // 4c — Build and create the document
  const excerpt = autoExcerpt(paragraphs)
  const slug = slugify(title)

  const doc = {
    _type: 'newsArticle',
    title,
    slug: { _type: 'slug', current: slug },
    date: isoDate,
    tag,
    excerpt,
    image: assetIds.length > 0
      ? { _type: 'image', asset: { _type: 'reference', _ref: assetIds[0] } }
      : undefined,
    body,
  }

  let created
  try {
    created = await client.create(doc)
  } catch (err) {
    if (err.statusCode === 401 || err.statusCode === 403) {
      console.error('\n  ERROR: Permission denied creating document.')
      console.error('  Create an Editor token in sanity.manage.com and set it as SANITY_WRITE_TOKEN in .env.local, then re-run.\n')
      process.exit(1)
    }
    throw err
  }

  console.log('\n  ✅ Document created!')
  console.log(`  _id:    ${created._id}`)
  console.log(`  Title:  ${created.title}`)
  console.log(`  Slug:   ${created.slug.current}`)
  console.log(`  Date:   ${created.date}`)
  console.log(`  Tag:    ${created.tag}`)
  console.log(`  Excerpt: ${created.excerpt}`)
  console.log(`\n  View in Studio: https://www.sanity.io/manage/personal/project/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}\n`)

  return created
}

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  const articleUrl = await promptUrl()
  const tag = await promptTag()
  console.log(`\n  Tagged as: ${tag}`)
  const { title, isoDate, paragraphs, images } = await scrape(articleUrl)
  const localPaths = await downloadImages(images)
  await importToSanity(title, isoDate, paragraphs, localPaths, tag)
}

main().catch(err => {
  console.error('\nFatal error:', err.message)
  process.exit(1)
})
