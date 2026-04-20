/**
 * useImageProcessor — K-Means skin tone analyzer (Nuxt composable)
 * Ported dari frontend/scripts/imageProcessor.js
 */
export function useImageProcessor() {

  /**
   * Baca file gambar dan kembalikan pixel data (array of {r,g,b})
   */
  function extractPixelData(file) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        const canvas = document.createElement('canvas')
        // Resize ke 200x200 agar K-Means cepat
        canvas.width  = 200
        canvas.height = 200
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, 200, 200)
        const data = ctx.getImageData(0, 0, 200, 200).data
        URL.revokeObjectURL(url)

        const pixels = []
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3]
          if (a < 128) continue // skip transparent
          // Filter piksel yang kemungkinan besar warna kulit
          if (isSkinPixel(r, g, b)) pixels.push({ r, g, b })
        }

        if (pixels.length < 100) {
          // Fallback: ambil semua pixel non-transparan
          const all = []
          for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] >= 128) all.push({ r: data[i], g: data[i+1], b: data[i+2] })
          }
          resolve(all)
        } else {
          resolve(pixels)
        }
      }
      img.onerror = () => reject(new Error('Gagal memuat gambar'))
      img.src = url
    })
  }

  /**
   * Heuristik sederhana: apakah piksel ini kemungkinan warna kulit?
   */
  function isSkinPixel(r, g, b) {
    return (
      r > 60 && g > 40 && b > 20 &&
      r > g && r > b &&
      Math.abs(r - g) > 10 &&
      r - b > 10 &&
      r < 240
    )
  }

  /**
   * K-Means clustering
   * @param {Array} pixels   - [{r,g,b}]
   * @param {number} k       - jumlah cluster
   * @param {number} maxIter - maksimum iterasi
   */
  function kMeansClustering(pixels, k = 5, maxIter = 50) {
    if (pixels.length === 0) throw new Error('Tidak ada piksel yang terdeteksi')

    // Inisialisasi centroid secara acak
    let centroids = []
    const used = new Set()
    while (centroids.length < k) {
      const idx = Math.floor(Math.random() * pixels.length)
      if (!used.has(idx)) {
        used.add(idx)
        centroids.push({ ...pixels[idx] })
      }
    }

    let assignments = new Array(pixels.length).fill(0)

    for (let iter = 0; iter < maxIter; iter++) {
      // Assign tiap pixel ke centroid terdekat
      let changed = false
      for (let i = 0; i < pixels.length; i++) {
        const best = nearestCentroid(pixels[i], centroids)
        if (best !== assignments[i]) { assignments[i] = best; changed = true }
      }
      if (!changed) break

      // Hitung centroid baru
      const sums   = Array.from({ length: k }, () => ({ r: 0, g: 0, b: 0, count: 0 }))
      for (let i = 0; i < pixels.length; i++) {
        const c = assignments[i]
        sums[c].r += pixels[i].r
        sums[c].g += pixels[i].g
        sums[c].b += pixels[i].b
        sums[c].count++
      }
      centroids = sums.map((s, ci) =>
        s.count > 0
          ? { r: s.r / s.count, g: s.g / s.count, b: s.b / s.count }
          : centroids[ci]
      )
    }

    // Hitung ukuran tiap cluster
    const clusterSizes = new Array(k).fill(0)
    assignments.forEach(c => clusterSizes[c]++)

    // Dominant cluster = terbesar
    const dominant = clusterSizes.indexOf(Math.max(...clusterSizes))
    const dominantColor = centroids[dominant]
    const dominantHex   = toHex(dominantColor)

    return {
      dominantColor,
      dominantHex,
      undertone: classifyUndertone(dominantColor),
      skinTone:  classifySkinTone(dominantColor),
      fitzpatrick: classifyFitzpatrick(dominantColor),
      clusters: centroids.map((c, i) => ({
        color: c,
        hex:   toHex(c),
        size:  clusterSizes[i],
        percent: Math.round((clusterSizes[i] / pixels.length) * 100)
      })).sort((a, b) => b.size - a.size)
    }
  }

  function nearestCentroid(pixel, centroids) {
    let minDist = Infinity, best = 0
    centroids.forEach((c, i) => {
      const d = Math.sqrt((pixel.r-c.r)**2 + (pixel.g-c.g)**2 + (pixel.b-c.b)**2)
      if (d < minDist) { minDist = d; best = i }
    })
    return best
  }

  function toHex({ r, g, b }) {
    return '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('')
  }

  /**
   * Klasifikasi undertone dari RGB
   */
  function classifyUndertone({ r, g, b }) {
    const warmScore = r - b
    const coolScore = b - r + (g - r) * 0.5
    if (warmScore > 20) return 'Warm'
    if (coolScore > 10) return 'Cool'
    return 'Neutral'
  }

  /**
   * Klasifikasi skin tone verbal
   */
  function classifySkinTone({ r, g, b }) {
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b
    if (luminance > 220) return 'Very Fair'
    if (luminance > 190) return 'Fair'
    if (luminance > 160) return 'Light Medium'
    if (luminance > 130) return 'Medium'
    if (luminance > 100) return 'Tan'
    if (luminance > 70)  return 'Deep'
    return 'Very Deep'
  }

  /**
   * Klasifikasi Fitzpatrick Scale (I–VI)
   */
  function classifyFitzpatrick({ r, g, b }) {
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b
    if (luminance > 210) return 'Type I'
    if (luminance > 185) return 'Type II'
    if (luminance > 155) return 'Type III'
    if (luminance > 120) return 'Type IV'
    if (luminance > 80)  return 'Type V'
    return 'Type VI'
  }

  /**
   * Bangun HTML hasil analisis untuk ditampilkan di result box
   */
  function buildResultHTML(result) {
    const swatchStyle = `
      width:3rem; height:3rem; border-radius:50%;
      background:${result.dominantHex};
      border:2px solid #d6cfc0; display:inline-block;
      vertical-align:middle; margin-right:0.5rem;
    `
    const rows = [
      { label: 'Dominant Color', value: `<span style="${swatchStyle}"></span>${result.dominantHex.toUpperCase()}` },
      { label: 'Undertone',      value: result.undertone },
      { label: 'Skin Tone',      value: result.skinTone },
      { label: 'Fitzpatrick',    value: result.fitzpatrick },
    ]

    const rowsHTML = rows.map(row => `
      <div class="result-row">
        <span class="result-label">${row.label}</span>
        <span class="result-value">${row.value}</span>
      </div>
    `).join('')

    const topClusters = result.clusters.slice(0, 3)
    const swatches = topClusters.map(c => `
      <span title="${c.hex} (${c.percent}%)" style="
        display:inline-block; width:2rem; height:2rem;
        border-radius:50%; background:${c.hex};
        border:2px solid #d6cfc0; margin-right:0.3rem;
        cursor:help;
      "></span>
    `).join('')

    return `
      ${rowsHTML}
      <div class="result-row" style="border-bottom:none; margin-top:0.5rem;">
        <span class="result-label">Top Colors</span>
        <span class="result-value">${swatches}</span>
      </div>
    `
  }

  return { extractPixelData, kMeansClustering, buildResultHTML }
}
