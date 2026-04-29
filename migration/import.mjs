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

const HEADING_STYLES = { h1: 'h1', h2: 'h2', h3: 'h3', h4: 'h4', h5: 'h5', h6: 'h6' }

async function promptUrl() {
  const arg = process.argv[2]
  if (arg) {
    try { new URL(arg) } catch {
      console.error('ERROR: Invalid URL provided:', arg)
      process.exit(1)
    }
    return arg
  }
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
    rl.question('\nEnter number (1-6): ', answer => {
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
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 96)
}

function autoExcerpt(paragraphTexts) {
  const full = paragraphTexts.join(' ')
  return full.length <= 300 ? full : full.slice(0, 297) + '...'
}

// ── Inline content parser ──────────────────────────────────────────────────────
// Walks an element's child nodes and returns Portable Text span objects,
// preserving bold (<strong>/<b>) and italic (<em>/<i>) marks.
function parseInlineContent(el, $, activeMarks = []) {
  const spans = []
  $(el).contents().each((_, node) => {
    if (node.type === 'text') {
      const text = node.data || ''
      if (text) spans.push({ _type: 'span', _key: key(), text, marks: [...activeMarks] })
    } else if (node.type === 'tag') {
      const tag = (node.tagName || '').toLowerCase()
      const newMarks = [...activeMarks]
      if (tag === 'strong' || tag === 'b') newMarks.push('strong')
      if (tag === 'em' || tag === 'i') newMarks.push('em')
      // Recurse into inline elements (spans, anchors, etc.)
      spans.push(...parseInlineContent(node, $, newMarks))
    }
  })
  return spans
}

// ── Step 2: Scrape (DOM-order content blocks) ──────────────────────────────────
async function scrape(articleUrl) {
  console.log('\n[Step 2] Scraping article...')
  const { data: html } = await axios.get(articleUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; migration-script/1.0)' },
    timeout: 15000,
  })
  const $ = cheerio.load(html)

  const title = $('h2.wp-block-post-title').first().text().trim()
  const contentEl = $('div.wp-block-post-content, div.entry-content, article').first()

  // ── Featured image ─────────────────────────────────────────────────────────
  let featuredImageUrl =
    $('figure.wp-block-post-featured-image img').first().attr('src') ||
    $('img.wp-post-image').first().attr('src') ||
    $('meta[property="og:image"]').attr('content') ||
    null
  if (featuredImageUrl) featuredImageUrl = featuredImageUrl.split('?')[0]

  // ── Image URL helpers ──────────────────────────────────────────────────────
  function bestSrc(el) {
    const srcset = $(el).attr('srcset') || ''
    if (srcset) {
      const largest = srcset.split(',')
        .map(s => s.trim().split(/\s+/))
        .sort((a, b) => parseInt(b[1] ?? '0') - parseInt(a[1] ?? '0'))[0]
      return largest?.[0] || null
    }
    return $(el).attr('src') || null
  }

  function normaliseUrl(src) {
    if (!src) return null
    const clean = src.split('?')[0]
    return clean.includes('wp-content/uploads') ? clean : null
  }

  // ── Walk content children in DOM order ────────────────────────────────────
  // contentBlocks: Array<
  //   { type: 'paragraph', spans: SpanObject[], plainText: string, style: string } |
  //   { type: 'gallery', urls: string[] }
  // >
  const contentBlocks = []

  function walkNode(el) {
    const tagName = (el.tagName || '').toLowerCase()
    const classes = $(el).attr('class') || ''

    // Detect image container blocks (galleries and single image blocks)
    const isImageBlock =
      classes.includes('wp-block-jetpack-tiled-gallery') ||
      classes.includes('wp-block-gallery') ||
      classes.includes('wp-block-image') ||
      classes.includes('wp-block-media-text') ||
      (tagName === 'figure' && classes.includes('wp-block'))

    if (isImageBlock) {
      const urls = []
      // Prefer full-size linked images (higher resolution than scaled inline src)
      $(el).find('a[href]').each((_, a) => {
        const href = ($(a).attr('href') || '').split('?')[0]
        const src = normaliseUrl(href)
        if (src && /\.(jpe?g|png|gif|webp)$/i.test(src) && src !== featuredImageUrl && !urls.includes(src)) {
          urls.push(src)
        }
      })
      // Fall back to img srcset/src for images not captured via links
      $(el).find('img').each((_, img) => {
        const src = normaliseUrl(bestSrc(img))
        if (src && src !== featuredImageUrl && !urls.includes(src)) urls.push(src)
      })
      if (urls.length > 0) contentBlocks.push({ type: 'gallery', urls })
      return
    }

    // Paragraph
    if (tagName === 'p') {
      const plainText = $(el).text().trim()
      if (!plainText) return
      const spans = parseInlineContent(el, $)
      if (spans.length > 0) contentBlocks.push({ type: 'paragraph', spans, plainText, style: 'normal' })
      return
    }

    // Headings — mapped to proper Portable Text styles
    if (HEADING_STYLES[tagName]) {
      const plainText = $(el).text().trim()
      if (!plainText) return
      const spans = parseInlineContent(el, $)
      if (spans.length > 0) contentBlocks.push({ type: 'paragraph', spans, plainText, style: HEADING_STYLES[tagName] })
      return
    }

    // For other containers, recurse into direct children
    $(el).children().each((_, child) => walkNode(child))
  }

  contentEl.children().each((_, child) => walkNode(child))

  // ── Date extraction from first paragraph ──────────────────────────────────
  const firstPara = contentBlocks.find(b => b.type === 'paragraph')
  const dateMatch = firstPara?.plainText.match(
    /^(\d{1,2})(?:st|nd|rd|th)\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/i
  )
  const isoDate = dateMatch
    ? new Date(`${dateMatch[2]} ${dateMatch[1]} ${dateMatch[3]}`).toISOString().split('T')[0]
    : null

  if (dateMatch && firstPara) {
    const stripped = firstPara.plainText.replace(/^[^:]+:\s*/, '').trim()
    if (!stripped) {
      contentBlocks.splice(contentBlocks.indexOf(firstPara), 1)
    } else {
      // Replace with a plain span — date lines never have bold/italic
      firstPara.plainText = stripped
      firstPara.spans = [{ _type: 'span', _key: key(), text: stripped, marks: [] }]
    }
  }

  // Collect all unique body image URLs in DOM order
  const allBodyImageUrls = []
  for (const block of contentBlocks) {
    if (block.type === 'gallery') {
      for (const url of block.urls) {
        if (!allBodyImageUrls.includes(url)) allBodyImageUrls.push(url)
      }
    }
  }

  const paraCount = contentBlocks.filter(b => b.type === 'paragraph').length
  const galleryCount = contentBlocks.filter(b => b.type === 'gallery').length
  console.log(`  Title:          ${title}`)
  console.log(`  Date:           ${isoDate}`)
  console.log(`  Paragraphs:     ${paraCount}`)
  console.log(`  Gallery blocks: ${galleryCount} (${allBodyImageUrls.length} images total)`)
  console.log(`  Featured image: ${featuredImageUrl ?? '(none found)'}`)

  return { title, isoDate, contentBlocks, featuredImageUrl, allBodyImageUrls }
}

// ── Step 3: Download images ────────────────────────────────────────────────────
async function downloadFile(url) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true })
  const filename = path.basename(url.split('?')[0])
  const dest = path.join(IMAGES_DIR, filename)
  if (fs.existsSync(dest)) {
    console.log(`  Already exists: ${filename}`)
    return dest
  }
  const response = await axios.get(url, { responseType: 'stream', timeout: 30000 })
  await new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(dest)
    response.data.pipe(writer)
    writer.on('finish', resolve)
    writer.on('error', reject)
  })
  console.log(`  Downloaded: ${filename}`)
  return dest
}

async function downloadImages(featuredImageUrl, allBodyImageUrls) {
  console.log('\n[Step 3] Downloading images...')
  const featuredPath = featuredImageUrl ? await downloadFile(featuredImageUrl) : null
  if (featuredPath) console.log(`  Featured image: ${path.basename(featuredPath)}`)

  const urlToPath = {}
  for (const url of allBodyImageUrls) {
    urlToPath[url] = await downloadFile(url)
  }
  return { featuredPath, urlToPath }
}

// ── Step 4: Import to Sanity ───────────────────────────────────────────────────
async function uploadImage(filePath) {
  const filename = path.basename(filePath)
  const ext = path.extname(filename).slice(1).toLowerCase()
  const mimeType = ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : 'image/jpeg'
  try {
    const asset = await client.assets.upload('image', createReadStream(filePath), {
      filename,
      contentType: mimeType,
    })
    console.log(`  Uploaded: ${filename} -> ${asset._id}`)
    return asset._id
  } catch (err) {
    if (err.statusCode === 401 || err.statusCode === 403) {
      console.error('\n  ERROR: Permission denied uploading assets.')
      console.error('  Create an Editor token in sanity.manage.com and set it as SANITY_WRITE_TOKEN in .env.local, then re-run.\n')
      process.exit(1)
    }
    throw err
  }
}

async function importToSanity(title, isoDate, contentBlocks, featuredPath, urlToPath, tag) {
  console.log('\n[Step 4] Importing to Sanity...')
  console.log('  Uploading images...')

  // 4a — Upload featured image
  const featuredAssetId = featuredPath ? await uploadImage(featuredPath) : null

  // 4b — Upload all body images and build URL -> assetId map
  const urlToAssetId = {}
  for (const [url, filePath] of Object.entries(urlToPath)) {
    urlToAssetId[url] = await uploadImage(filePath)
  }

  // 4c — Build Portable Text body in DOM order
  const body = []
  for (const block of contentBlocks) {
    if (block.type === 'paragraph') {
      body.push({
        _type: 'block',
        _key: key(),
        style: block.style,
        children: block.spans,
        markDefs: [],
      })
    } else if (block.type === 'gallery') {
      const assetIds = block.urls.map(url => urlToAssetId[url]).filter(Boolean)
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
    }
  }

  // 4d — Excerpt from plain text of paragraph blocks only
  const paragraphTexts = contentBlocks.filter(b => b.type === 'paragraph').map(b => b.plainText)
  const excerpt = autoExcerpt(paragraphTexts)
  const slug = slugify(title)

  // Cover: featured image, else first body image
  const firstBodyAssetId = Object.values(urlToAssetId)[0] ?? null
  const coverAssetId = featuredAssetId ?? firstBodyAssetId ?? null

  const doc = {
    _type: 'newsArticle',
    title,
    slug: { _type: 'slug', current: slug },
    date: isoDate,
    tag,
    excerpt,
    image: coverAssetId
      ? { _type: 'image', asset: { _type: 'reference', _ref: coverAssetId } }
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

  console.log('\n  Document created!')
  console.log(`  _id:     ${created._id}`)
  console.log(`  Title:   ${created.title}`)
  console.log(`  Slug:    ${created.slug.current}`)
  console.log(`  Date:    ${created.date}`)
  console.log(`  Tag:     ${created.tag}`)
  console.log(`  Excerpt: ${created.excerpt}`)
  console.log(`\n  View in Studio: https://www.sanity.io/manage/personal/project/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}\n`)

  return created
}

// ── Cleanup ────────────────────────────────────────────────────────────────────
function clearImagesFolder() {
  if (!fs.existsSync(IMAGES_DIR)) return
  const files = fs.readdirSync(IMAGES_DIR)
  for (const file of files) {
    fs.rmSync(path.join(IMAGES_DIR, file))
  }
  console.log(`\n[Cleanup] Removed ${files.length} file${files.length !== 1 ? 's' : ''} from migration/images/`)
}

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  const articleUrl = await promptUrl()
  const tag = await promptTag()
  console.log(`\n  Tagged as: ${tag}`)
  const { title, isoDate, contentBlocks, featuredImageUrl, allBodyImageUrls } = await scrape(articleUrl)
  const { featuredPath, urlToPath } = await downloadImages(featuredImageUrl, allBodyImageUrls)
  await importToSanity(title, isoDate, contentBlocks, featuredPath, urlToPath, tag)
  clearImagesFolder()
}

main().catch(err => {
  console.error('\nFatal error:', err.message)
  process.exit(1)
})
