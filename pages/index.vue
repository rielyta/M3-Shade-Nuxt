<template>
  <main>
    <!-- Hero Section -->
    <section id="hero">
      <div class="hero-content">
        <img src="/black-logo.png" alt="M3-Shade Logo" class="black-logo" />
        <p>Three Steps Closer to Match My Shade</p>
        <NuxtLink to="/find-your-shade" class="btn-get-started">Get Started</NuxtLink>
      </div>
    </section>

    <div class="main-wrapper">
      <div class="main-content">

        <!-- Description -->
        <div id="content">
          <h1>Discover M3-Shade</h1>
          <article class="description">
            <h2>Match Made in Heaven <span>for Your Skin</span></h2>
            <p>"M3-Shade is where your unique beauty meets its perfect reflection. We believe that finding the right tone shouldn't be a struggle, but a journey to discovering the glow you were born with. Experience a match made in heaven, tailored specifically for your skin's unique story"</p>
          </article>
        </div>

        <!-- Steps -->
        <article id="steps">
          <div class="box-steps">
            <h2 class="steps-title">
              The<br>Three<br>Steps
            </h2>
            <div class="steps-list">
              <div class="step-item">Map Your Tone</div>
              <div class="step-item">Measure Your Undertone</div>
              <div class="step-item">Match Your Shade</div>
            </div>
          </div>
        </article>

        <!-- Why M3-Shade -->
        <article id="why-m3">
          <h2>Why M3-Shade 💄</h2>
          <div class="why-m3-list">
            <section class="why-m3-row">
              <h3>Precision</h3>
              <p>No more guessing your foundation shade.</p>
            </section>
            <section class="why-m3-row">
              <h3>Tailored</h3>
              <p>Curated specifically for your unique undertone.</p>
            </section>
            <section class="why-m3-row">
              <h3>Simple</h3>
              <p>Find your match in under 3 minutes.</p>
            </section>
          </div>
        </article>

      </div>

      <!-- Sidebar -->
      <aside>
        <article class="community">
          <img src="/aside-home.png" alt="Community Image" class="community-img" />
          <div class="community-body">
            <h4>Join the M3-Shade Community</h4>
            <p>Join over 10,000+ people who have found their perfect shade with M3-Shade. Your journey to flawless beauty starts here.</p>
          </div>
        </article>
      </aside>
    </div>
  </main>
</template>

<script setup>
useHead({
  title: 'M3-Shade | Multimodal Makeup Matcher',
  meta: [
    { name: 'description', content: 'Temukan shade makeup yang sempurna dengan teknologi AI dan computer vision' }
  ]
})
</script>

<style scoped>
.hero-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
