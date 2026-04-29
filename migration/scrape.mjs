import axios from 'axios'
import * as cheerio from 'cheerio'

const URL = 'https://1stmeathdunboynescouts.ie/news-and-events-2026/four-peak-challenge-carrantuohill/'

async function scrape() {
  console.log(`\nFetching: ${URL}\n`)
  const { data: html } = await axios.get(URL, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; migration-script/1.0)' },
    timeout: 15000,
  })

  const $ = cheerio.load(html)

  // ── Title ─────────────────────────────────────────────────────────────────────
  // This WordPress theme uses h2.wp-block-post-title for the article heading
  const title = $('h2.wp-block-post-title').first().text().trim()

  // ── Content area ──────────────────────────────────────────────────────────────
  // Target the post content block — excludes header and footer
  const contentEl = $('div.wp-block-post-content, div.entry-content, article').first()

  // ── Body paragraphs ───────────────────────────────────────────────────────────
  const paragraphs = []
  contentEl.find('p').each((_, el) => {
    const text = $(el).text().trim()
    if (text) paragraphs.push(text)
  })

  // ── Date — extract from first paragraph (e.g. "14th Mar 2026: ...")  ──────────
  let rawDate = ''
  let isoDate = ''
  const dateMatch = paragraphs[0]?.match(
    /^(\d{1,2})(?:st|nd|rd|th)\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/i
  )
  if (dateMatch) {
    rawDate = dateMatch[0]
    const parsed = new Date(`${dateMatch[2]} ${dateMatch[1]} ${dateMatch[3]}`)
    isoDate = parsed.toISOString().split('T')[0]
  }

  // Strip the leading date from the first paragraph for clean body text
  const cleanParagraphs = paragraphs.map((p, i) => {
    if (i === 0 && rawDate) return p.replace(/^[^:]+:\s*/, '').trim()
    return p
  }).filter(Boolean)

  // ── Images from wp-content/uploads ───────────────────────────────────────────
  const images = []

  const addImage = (src) => {
    if (!src) return
    src = src.split('?')[0]
    if (src.includes('wp-content/uploads') && !images.includes(src)) images.push(src)
  }

  contentEl.find('img').each((_, el) => {
    // Prefer largest from srcset
    const srcset = $(el).attr('srcset') || ''
    if (srcset) {
      const largest = srcset.split(',')
        .map(s => s.trim().split(/\s+/))
        .sort((a, b) => parseInt(b[1] ?? '0') - parseInt(a[1] ?? '0'))[0]
      addImage(largest?.[0])
    } else {
      addImage($(el).attr('src'))
    }
  })

  // Also check anchor hrefs for full-size images
  contentEl.find('a[href]').each((_, el) => {
    const href = $(el).attr('href') || ''
    if (/\.(jpe?g|png|gif|webp)$/i.test(href)) addImage(href)
  })

  // ── Output ────────────────────────────────────────────────────────────────────
  console.log('═══════════════════════════════════════')
  console.log('TITLE:   ', title)
  console.log('DATE:    ', rawDate, `→ ISO: ${isoDate}`)
  console.log('───────────────────────────────────────')
  console.log(`BODY PARAGRAPHS (${cleanParagraphs.length}):`)
  cleanParagraphs.forEach((p, i) => console.log(`  [${i + 1}] ${p}`))
  console.log('───────────────────────────────────────')
  console.log(`IMAGES (${images.length}):`)
  images.forEach((img, i) => console.log(`  [${i + 1}] ${img}`))
  console.log('═══════════════════════════════════════')

  return { title, rawDate, isoDate, paragraphs: cleanParagraphs, images }
}

scrape().catch(err => {
  console.error('Scrape failed:', err.message)
  process.exit(1)
})
