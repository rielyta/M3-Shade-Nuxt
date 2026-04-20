<template>
  <div class="layout-wrapper">
    <header>
      <nav>
        <ul>
          <li>
            <NuxtLink to="/">
              <img src="/white-logo.png" alt="logo" class="white-logo" />
            </NuxtLink>
          </li>
          <li><NuxtLink to="/">Home</NuxtLink></li>
          <li><NuxtLink to="/find-your-shade">Find Your Shade</NuxtLink></li>
          <li><NuxtLink to="/skin-guide">Skin Guide</NuxtLink></li>
          <li :class="['chatbot-icon', route.path === '/chatbot' ? 'active' : '']">
            <NuxtLink to="/chatbot" title="Chatbot Assistant">💬</NuxtLink>
          </li>
        </ul>
      </nav>
    </header>

    <main class="layout-main">
      <slot />
    </main>

    <AppFooter />
  </div>
</template>

<script setup>
const route = useRoute()
</script>

<style scoped>
.layout-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.layout-main {
  flex: 1;
}
</style>
