/**
 * useApiClient — Anthropic API & shade matching (Nuxt composable)
 * Ported dari frontend/scripts/apiClient.js
 */
export function useApiClient() {
  const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'
  const MODEL = 'claude-sonnet-4-20250514'

  let datasetCache = null

  // ─── 1. CHATBOT ─────────────────────────────────────────────
  async function sendChatMessage(message, conversationHistory = []) {
    const messages = [
      ...conversationHistory,
      { role: 'user', content: message }
    ]

    const response = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1000,
        system: `Kamu adalah M3-Shade Assistant, konsultan kecantikan AI yang ramah dan berpengetahuan luas.
Spesialisasi kamu:
- Undertone kulit (cool, warm, neutral) dan cara mendeteksinya
- Fitzpatrick Scale (Type I–VI) dan implikasinya pada pemilihan makeup
- Rekomendasi shade foundation, concealer, dan bedak sesuai skin tone
- Tips makeup berdasarkan warna kulit dan undertone

Aturan jawaban:
- Jawab dalam Bahasa Indonesia yang ramah dan profesional
- Maksimal 3 paragraf per jawaban
- Jika pertanyaan di luar topik kecantikan dan skin tone, arahkan kembali dengan sopan`,
        messages
      })
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(`Anthropic API error ${response.status}: ${err.error?.message || 'Unknown error'}`)
    }

    const data = await response.json()
    return data.content?.[0]?.text ?? 'Maaf, saya tidak dapat merespons saat ini.'
  }

  // ─── 2. SHADE MATCHING ──────────────────────────────────────
  async function _loadDataset() {
    if (datasetCache) return datasetCache
    const response = await fetch('/foundation-shades.json')
    if (!response.ok) throw new Error('Dataset foundation tidak ditemukan.')
    datasetCache = await response.json()
    return datasetCache
  }

  function _colorDistance(hex1, hex2) {
    const parse = (hex) => {
      const h = hex.replace('#', '')
      return {
        r: parseInt(h.substring(0, 2), 16),
        g: parseInt(h.substring(2, 4), 16),
        b: parseInt(h.substring(4, 6), 16)
      }
    }
    const c1 = parse(hex1), c2 = parse(hex2)
    return Math.sqrt((c1.r-c2.r)**2 + (c1.g-c2.g)**2 + (c1.b-c2.b)**2)
  }

  function _distanceToScore(distance) {
    return Math.round((1 - distance / 441.67) * 100)
  }

  async function getShadeRecommendations(hexColor, undertone = null, limit = 5) {
    const dataset = await _loadDataset()
    const scored = dataset
      .filter(p => !undertone || !p.undertone || p.undertone.toLowerCase() === undertone.toLowerCase())
      .map(p => ({ ...p, distance: _colorDistance(hexColor, p.hex) }))
    scored.sort((a, b) => a.distance - b.distance)
    return scored.slice(0, limit).map(p => ({
      ...p,
      matchScore: _distanceToScore(p.distance)
    }))
  }

  // ─── 3. VISION ANALYSIS ─────────────────────────────────────
  async function analyzeImageWithVision(imageFile) {
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload  = e => resolve(e.target.result.split(',')[1])
      reader.onerror = reject
      reader.readAsDataURL(imageFile)
    })

    const response = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: imageFile.type || 'image/jpeg', data: base64 } },
            {
              type: 'text',
              text: `Analisis warna kulit pada foto ini. Berikan jawaban dalam format JSON:
{
  "skinTone": "Very Fair|Fair|Light Medium|Medium|Tan|Deep|Very Deep",
  "undertone": "Cool|Warm|Neutral",
  "fitzpatrick": "I|II|III|IV|V|VI",
  "hexEstimate": "#RRGGBB",
  "description": "deskripsi singkat dalam Bahasa Indonesia"
}
Hanya output JSON, tanpa teks lain.`
            }
          ]
        }]
      })
    })

    if (!response.ok) throw new Error(`Vision API error: ${response.status}`)
    const data = await response.json()
    const text = data.content?.[0]?.text ?? '{}'
    try {
      return JSON.parse(text.replace(/```json|```/g, '').trim())
    } catch {
      throw new Error('Gagal mem-parse respons vision API.')
    }
  }

  return { sendChatMessage, getShadeRecommendations, analyzeImageWithVision }
}
