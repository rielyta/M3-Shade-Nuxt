<template>
  <div class="chatbot-page">
    <main>
      <h1>Have Any Question</h1>

      <div class="chat-outer-box">
        <!-- Suggestion chips -->
        <div class="chat-suggestions">
          <button
            v-for="chip in suggestions"
            :key="chip"
            class="suggestion-chip"
            @click="sendSuggestion(chip)"
          >{{ chip }}</button>
        </div>

        <!-- Messages -->
        <div ref="messagesContainer" class="messages-container">
          <div
            v-for="(msg, i) in messages"
            :key="i"
            :class="['message', `message-${msg.role}`]"
          >
            <div :class="['message-bubble', msg.role === 'error' ? 'message-error' : '']">
              <template v-if="msg.role === 'typing'">
                <div class="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </template>
              <template v-else>{{ msg.content }}</template>
            </div>
          </div>
        </div>

        <!-- Input -->
        <div class="chat-input-container">
          <input
            v-model="inputText"
            class="message-input"
            type="text"
            placeholder="Write Your Message Here"
            autocomplete="off"
            @keydown.enter.prevent="sendMessage"
          />
          <button
            class="send-button"
            :disabled="sending"
            @click="sendMessage"
            title="Send"
          >&#9658;</button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useApiClient } from '~/composables/useApiClient'

definePageMeta({ layout: 'chatbot' })

useHead({
  title: 'Chatbot Konsultasi | M3-Shade',
  meta: [{ name: 'description', content: 'M3-Shade Chatbot - Konsultasi makeup dan skin tone dengan AI' }]
})

const { sendChatMessage } = useApiClient()

const suggestions = [
  'Apa itu undertone kulit?',
  'Bagaimana cara menentukan undertone saya?',
  'Apa perbedaan cool, warm, dan neutral undertone?',
  'Foundation apa yang cocok untuk kulit berminyak?',
  'Bagaimana memilih shade foundation yang tepat?',
  'Apa itu Fitzpatrick scale?'
]

const messages         = ref([])
const inputText        = ref('')
const sending          = ref(false)
const messagesContainer = ref(null)

// Conversation history for context
const history = ref([])

onMounted(() => {
  pushMessage('bot', 'Halo! Saya M3-Shade Assistant 💄 Saya siap membantu kamu menemukan shade makeup yang sempurna. Tanyakan apa saja tentang undertone, foundation, atau tips kecantikan!')
})

function pushMessage(role, content) {
  messages.value.push({ role, content })
  nextTick(() => scrollToBottom())
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

async function sendMessage() {
  const text = inputText.value.trim()
  if (!text || sending.value) return

  inputText.value = ''
  pushMessage('user', text)

  // Typing indicator
  messages.value.push({ role: 'typing', content: '' })
  sending.value = true
  nextTick(() => scrollToBottom())

  try {
    const reply = await sendChatMessage(text, history.value)

    // Remove typing indicator
    messages.value = messages.value.filter(m => m.role !== 'typing')

    pushMessage('bot', reply)

    // Update history
    history.value.push({ role: 'user', content: text })
    history.value.push({ role: 'assistant', content: reply })

    // Keep history to last 10 exchanges
    if (history.value.length > 20) history.value = history.value.slice(-20)

  } catch (err) {
    messages.value = messages.value.filter(m => m.role !== 'typing')
    pushMessage('error', 'Terjadi kesalahan koneksi. Coba lagi ya!')
  }

  sending.value = false
}

function sendSuggestion(text) {
  inputText.value = text
  sendMessage()
}
</script>

<style scoped>
/* Chatbot uses its own layout, so we re-add header/footer inline */
.chatbot-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #F9F8EA;
}

/* Inherit nav from global but ensure page bg */
</style>
