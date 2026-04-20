<template>
  <main class="fys-main">
    <h1>Find Your Shade</h1>

    <div class="fys-wrapper">
      <!-- Left: Camera Upload -->
      <div class="fys-camera-col">
        <div class="fys-camera-box" @click="triggerUpload">
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            style="display:none"
            @change="onFileChange"
          />
          <img
            v-if="previewUrl"
            :src="previewUrl"
            style="width:100%; height:100%; object-fit:cover; border-radius:1rem;"
            alt="Preview"
          />
          <div v-else class="camera-placeholder">
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24"
              fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="1.5"
              stroke-linecap="round" stroke-linejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </div>
        </div>
        <button class="btn-take-picture" @click="triggerUpload">Take Picture</button>
      </div>

      <!-- Right: Result Box -->
      <div class="fys-result-box">
        <h2 class="result-title">Result</h2>

        <!-- Idle -->
        <p v-if="state === 'idle'" style="color:#aaa; font-size:0.95rem;">
          Upload a photo to see your skin analysis here.
        </p>

        <!-- Analyzing -->
        <div v-else-if="state === 'analyzing'" class="result-analyzing">
          <div class="spinner"></div>
          <p style="margin:0; font-size:0.95rem;">Menganalisis warna kulit…</p>
        </div>

        <!-- Error -->
        <p v-else-if="state === 'error'" style="color:#E9026E; font-size:0.95rem; padding:1rem 0;">
          ⚠️ Terjadi kesalahan saat menganalisis gambar. Coba lagi dengan foto yang berbeda.
        </p>

        <!-- Result -->
        <template v-else-if="state === 'done' && result">
          <div class="result-row">
            <span class="result-label">Dominant Color</span>
            <span class="result-value">
              <span :style="swatchStyle(result.dominantHex)"></span>
              {{ result.dominantHex.toUpperCase() }}
            </span>
          </div>
          <div class="result-row">
            <span class="result-label">Undertone</span>
            <span class="result-value">{{ result.undertone }}</span>
          </div>
          <div class="result-row">
            <span class="result-label">Skin Tone</span>
            <span class="result-value">{{ result.skinTone }}</span>
          </div>
          <div class="result-row">
            <span class="result-label">Fitzpatrick</span>
            <span class="result-value">{{ result.fitzpatrick }}</span>
          </div>
          <div class="result-row" style="border-bottom:none; margin-top:0.5rem;">
            <span class="result-label">Top Colors</span>
            <span class="result-value">
              <span
                v-for="(c, i) in result.clusters.slice(0, 3)"
                :key="i"
                :title="`${c.hex} (${c.percent}%)`"
                :style="miniSwatchStyle(c.hex)"
              ></span>
            </span>
          </div>

          <!-- Shade Recommendations -->
          <template v-if="recommendations.length">
            <h3 style="color:#E9026E; font-size:1.1rem; margin-top:1.5rem; text-align:left;">
              Foundation Recommendations
            </h3>
            <div v-for="(rec, i) in recommendations" :key="i" class="result-row" style="align-items:center;">
              <span class="result-label" style="font-size:0.8rem;">{{ rec.brand }}</span>
              <span class="result-value" style="font-size:0.85rem;">
                {{ rec.product }} — {{ rec.shade }}
                <span style="color:#8B6F3A;">({{ rec.matchScore }}% match)</span>
              </span>
              <span :style="swatchStyle(rec.hex)" style="flex-shrink:0;"></span>
            </div>
          </template>
        </template>
      </div>
    </div>

    <!-- Feedback -->
    <section id="feedback">
      <h3>Feedback</h3>
      <form class="feedback-form" @submit.prevent="submitFeedback">
        <label for="email">Email</label>
        <input v-model="feedbackEmail" type="email" id="email" required />
        <label for="feedbackText">Feedback</label>
        <textarea v-model="feedbackText" id="feedbackText" required></textarea>
        <button type="submit" class="btn-submit-feedback">Submit</button>
      </form>
      <p v-if="feedbackSent" style="color:#F9F8EA; padding-left:3rem; margin-top:0.5rem;">
        ✅ Terima kasih atas feedback kamu!
      </p>
    </section>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useImageProcessor } from '~/composables/useImageProcessor'
import { useApiClient } from '~/composables/useApiClient'

useHead({
  title: 'Find Your Shade | M3-Shade',
  meta: [{ name: 'description', content: 'Upload foto wajah Anda untuk menemukan shade makeup yang sempurna' }]
})

const { extractPixelData, kMeansClustering } = useImageProcessor()
const { getShadeRecommendations } = useApiClient()

const fileInput     = ref(null)
const previewUrl    = ref(null)
const state         = ref('idle') // idle | analyzing | done | error
const result        = ref(null)
const recommendations = ref([])

const feedbackEmail = ref('')
const feedbackText  = ref('')
const feedbackSent  = ref(false)

function triggerUpload() {
  fileInput.value?.click()
}

async function onFileChange(e) {
  const file = e.target.files[0]
  if (!file) return

  // Preview
  previewUrl.value = URL.createObjectURL(file)
  state.value = 'analyzing'
  result.value = null
  recommendations.value = []

  try {
    const pixels = await extractPixelData(file)
    result.value  = kMeansClustering(pixels, 5, 50)
    state.value   = 'done'

    // Fetch shade recommendations (best-effort)
    try {
      recommendations.value = await getShadeRecommendations(result.value.dominantHex, result.value.undertone, 3)
    } catch {
      // Silently fail if dataset not available
    }
  } catch (err) {
    console.error(err)
    state.value = 'error'
  }
}

function swatchStyle(hex) {
  return {
    display: 'inline-block',
    width: '2.5rem',
    height: '2.5rem',
    borderRadius: '50%',
    background: hex,
    border: '2px solid #d6cfc0',
    verticalAlign: 'middle',
    marginRight: '0.5rem'
  }
}

function miniSwatchStyle(hex) {
  return {
    display: 'inline-block',
    width: '2rem',
    height: '2rem',
    borderRadius: '50%',
    background: hex,
    border: '2px solid #d6cfc0',
    marginRight: '0.3rem',
    cursor: 'help'
  }
}

function submitFeedback() {
  feedbackEmail.value = ''
  feedbackText.value  = ''
  feedbackSent.value  = true
  setTimeout(() => { feedbackSent.value = false }, 4000)
}
</script>
