'use server'

import * as cheerio from 'cheerio'

export async function analyzeImageWithOCR(base64Image: string) {
  try {
    const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY

    if (!apiKey) {
      throw new Error('Google Cloud Vision API key not configured')
    }

    // Remove data:image prefix if present
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '')

    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: base64Data,
              },
              features: [
                {
                  type: 'TEXT_DETECTION',
                  maxResults: 1,
                },
              ],
            },
          ],
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Vision API error: ${errorText}`)
    }

    const data = await response.json()
    const textAnnotations = data.responses?.[0]?.textAnnotations

    if (!textAnnotations || textAnnotations.length === 0) {
      return { success: false, error: 'No text detected in image' }
    }

    // First annotation contains full text
    const fullText = textAnnotations[0].description

    // Parse products from OCR text
    const products = parseProductsFromOCR(fullText)

    return {
      success: true,
      fullText,
      products,
    }
  } catch (error) {
    console.error('OCR analysis error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze image',
    }
  }
}

function parseProductsFromOCR(text: string): Array<{
  name: string
  sale_price: number | null
  original_price: number | null
  category: string | null
}> {
  // This is a basic parser - will need refinement based on actual flyer format
  const products: Array<{
    name: string
    sale_price: number | null
    original_price: number | null
    category: string | null
  }> = []

  // Split by lines
  const lines = text.split('\n').filter((line) => line.trim())

  // Pattern: Look for price patterns (e.g., "9,900원", "19900")
  const pricePattern = /[\d,]+원?/g

  let currentProduct: {
    name: string
    sale_price: number | null
    original_price: number | null
    category: string | null
  } | null = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // Skip very short lines
    if (line.length < 2) continue

    // Check if line contains price
    const prices = line.match(pricePattern)

    if (prices && prices.length > 0) {
      // Extract prices
      const extractedPrices = prices.map((p) =>
        parseInt(p.replace(/[^0-9]/g, ''), 10)
      )

      // Filter out numbers that are likely not prices (e.g. small quantities, dates)
      // KRW prices are typically > 100, or explicitly contain '원'
      // This is a heuristic
      const validPrices = extractedPrices.filter(p => p > 100)

      if (validPrices.length > 0) {
        // Heuristic: If multiple prices found, the lower one is likely the sale price
        // and the higher one is the original price.
        const sortedPrices = [...validPrices].sort((a, b) => a - b)
        const salePrice = sortedPrices[0]
        const originalPrice = sortedPrices.length > 1 ? sortedPrices[sortedPrices.length - 1] : null

        // Assume product name is in previous line or current line before price
        const productName = line.replace(pricePattern, '').trim() || lines[i - 1]?.trim() || '미확인 상품'

        if (currentProduct && currentProduct.name !== productName) {
          products.push(currentProduct)
        }

        currentProduct = {
          name: productName,
          sale_price: salePrice,
          original_price: originalPrice,
          category: null, // Will be set manually by admin
        }
      }
    }
  }

  if (currentProduct) {
    products.push(currentProduct)
  }

  return products
}

export async function fetchCoupangPrice(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Referer': 'https://www.coupang.com/',
      },
      next: { revalidate: 0 } // Don't cache the fetch result
    })

    if (!response.ok) {
       // Try without headers if first attempt fails (sometimes simple requests work better for some endpoints) or just throw
      throw new Error(`Failed to fetch Coupang page: ${response.status} ${response.statusText}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Selectors might change, but these are common for Coupang
    // Attempt multiple selectors
    let priceText = 
      $('.prod-sale-price .total-price').text() || 
      $('.total-price > strong').text() ||
      $('.price-value').text() ||
      $('.prod-sale-price').text() ||
      $('span.total-price').text()

    // Clean up price (remove non-digits)
    const price = priceText ? parseInt(priceText.replace(/[^0-9]/g, ''), 10) : null

    // Also try to get image
    const image = $('.prod-image__detail').attr('src') || $('.prod-image__main').attr('src') || $('.prod-img-list img').first().attr('src')

    return { success: true, price, image }
  } catch (error) {
    console.error('Coupang fetch error:', error)
    return { success: false, error: 'Failed to fetch price' }
  }
}
