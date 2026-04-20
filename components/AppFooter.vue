<template>
  <footer class="site-footer">
    <div class="footer-container">
      <div class="footer-brand">
        <img src="/white-logo.png" alt="M3-Shade Logo" class="footer-logo-img" />
        <p class="footer-tagline">Three Steps Closer to Match My Shade</p>
      </div>

      <div class="footer-links">
        <h4>Navigate</h4>
        <ul>
          <li><NuxtLink to="/">Home</NuxtLink></li>
          <li><NuxtLink to="/find-your-shade">Find Your Shade</NuxtLink></li>
          <li><NuxtLink to="/skin-guide">Skin Guide</NuxtLink></li>
          <li><NuxtLink to="/chatbot">Chatbot</NuxtLink></li>
        </ul>
      </div>

      <div class="footer-contact">
        <h4>Contact Us</h4>
        <p>
          <span class="footer-contact-icon">📸</span>
          <a href="https://instagram.com/m3shade_official" target="_blank" rel="noopener">@m3shade_official</a>
        </p>
        <p>
          <span class="footer-contact-icon">✉️</span>
          <a href="mailto:support@m3shade.com">support@m3shade.com</a>
        </p>
      </div>
    </div>

    <div class="footer-bottom">
      <p>&copy; {{ new Date().getFullYear() }} M3-Shade. All Rights Reserved.</p>
    </div>
  </footer>
</template>
