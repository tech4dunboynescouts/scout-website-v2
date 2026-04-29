import axios from 'axios'
import * as cheerio from 'cheerio'

const URL = 'https://1stmeathdunboynescouts.ie/news-and-events-2026/four-peak-challenge-carrantuohill/'

const { data: html } = await axios.get(URL, {
  headers: { 'User-Agent': 'Mozilla/5.0 (compatible; migration-script/1.0)' },
  timeout: 15000,
})

const $ = cheerio.load(html)

console.log('\n── All H1/H2/H3 tags ──')
$('h1,h2,h3').each((_, el) => {
  console.log(`<${el.name} class="${$(el).attr('class') ?? ''}">`, $(el).text().trim())
})

console.log('\n── <time> tags ──')
$('time').each((_, el) => {
  console.log('datetime=', $(el).attr('datetime'), ' text=', $(el).text().trim())
})

console.log('\n── Classes containing "date","title","entry","post","article","content" ──')
$('[class]').each((_, el) => {
  const cls = $(el).attr('class') ?? ''
  if (/date|title|entry|post-title|article|content/i.test(cls)) {
    const text = $(el).clone().children().remove().end().text().trim()
    if (text) console.log(`<${el.name} class="${cls}">`, text.slice(0, 120))
  }
})
