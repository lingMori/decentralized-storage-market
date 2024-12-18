<template>
  <header id="header">
    <div class="header-title">
      <h1>InstaShare<span class="emoji">⚡</span></h1>
      <span>Instant File Sharing powered by IPFS Protocol</span>
    </div>
    <div class="header-menu">
      <nav class="header-navbar">
        <router-link :to="{ name: 'Upload' }" active-class="active" exact>Home</router-link>
        <router-link :to="{ name: 'Filebox' }" active-class="active" exact>File Box</router-link>
        <router-link :to="{ name: 'Public' }" active-class="active">Public</router-link>
        <w3m-button style="margin: 0px 7px;" label="wallet connect" />
        <i :title="`Switch to ${isDark ? 'Light' : 'Dark'} Theme`">
          <i-mdi-brightness-7 v-if="isDark" class="icon-color" @click="toggleTheme" />
          <i-mdi-brightness-4 v-else class="icon-color" @click="toggleTheme" />
        </i>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const isDark = ref<boolean>(false);

const applyTheme = (theme: 'dark' | 'light') => {
  if (theme === 'dark') {
    document.body.classList.add("dark-theme", "dark");
    isDark.value = true;
    localStorage.setItem("theme", "dark");
  } else {
    document.body.classList.remove("dark-theme", "dark");
    isDark.value = false;
    localStorage.setItem("theme", "light");
  }
  
  toggleAnimation();
};

const toggleTheme = () => {
  applyTheme(isDark.value ? 'light' : 'dark');
};

const toggleAnimation = () => {
  const element = document.querySelector("section#content .main");
  
  element?.classList.remove("animated");
  if (element instanceof HTMLElement) {
    void element.offsetWidth;
  }
  element?.classList.add("animated");
};

onMounted(() => {
  // Check localStorage first
  const savedTheme = localStorage.getItem("theme");
  
  if (savedTheme) {
    // If a theme is saved, apply that theme
    applyTheme(savedTheme as 'dark' | 'light');
  } else {
    // If no saved theme, check system preference
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Apply dark theme by default if system prefers dark mode
    applyTheme(prefersDarkMode ? 'dark' : 'light');
  }
});
</script>

<style scoped lang="scss">
#header {
  position: fixed;
  /* 使 header 固定在顶部 */
  top: 0;
  left: 0;
  width: 100%;
  z-index: 10;
  /* 保证 header 在其他元素之上 */

  display: flex;
  justify-content: space-between;
  align-items: center;

  transition: border-bottom 0.5s ease;
  padding: 1.3em 64px;
  border-bottom: 0.5px solid rgb(243, 244, 246);

  backdrop-filter: blur(8px);
  /* 在 header 背后应用高斯模糊 */
  -webkit-backdrop-filter: blur(8px);
  /* 支持 Safari */

  .header-title {
    h1 {
      font-size: 1.7rem;
      font-weight: 700;
      margin: 0 0 8px 0;
      color: #333;

      span.emoji {
        font-size: 1.6rem;
      }
    }

    span {
      font-size: .9rem;
    }
  }

  .header-menu {
    display: flex;
    align-items: center;

    nav {
      display: flex;
      align-items: center;
      text-align: right;
      padding: 0.3em;

      a {
        color: var(--contrast-color);
        margin-right: 16px;
        padding-bottom: 8px;
        text-decoration: none;

        border-bottom: 1px solid;
        cursor: pointer;

        &.active {
          font-weight: bold;
        }
      }

      svg {
        cursor: pointer;
        font-size: 2em;
      }
    }
  }
}

body.dark-theme {
  #header {
    border-bottom: 1px solid #1c2435;

    .header-title h1 {
      color: #ffffff;
    }
  }
}
</style>
