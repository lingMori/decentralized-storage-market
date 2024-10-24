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

        <a href="https://github.com/lingMori" target="_blank" rel="noopener">Github</a>

        <w3m-button style="margin: 0px 7px;" label="wallet connect"/>

        <i :title="`Switch to ${isDark ? 'Light' : 'Dark'} Theme`">
          <i-mdi-brightness-7 v-if="isDark" class="icon-color" @click="toggleTheme" />
          <i-mdi-brightness-4 v-else class="icon-color" @click="toggleTheme" />
        </i>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const isDarkClassAvaliable: boolean = document.body.classList.contains("dark-theme");
const isDark = ref<boolean>(isDarkClassAvaliable)

const toggleTheme = () => {
  document.body.classList.toggle("dark-theme")
  requestAnimationFrame(toggleAnimation)

  isDark.value = !isDark.value
  localStorage.setItem("theme", isDark.value ? "dark" : "light")
  isDark.value ? document.body.classList.add("dark") : document.body.classList.remove("dark")
}

const toggleAnimation = () => {
  const element = document.querySelector("section#content .main");

  element?.classList.remove("animated");
  if (element instanceof HTMLElement) {
    void element.offsetWidth;
  }
  element?.classList.add("animated");
}


</script>

<style scoped lang="scss">
#header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  transition: border-bottom 0.5s ease;

  padding: 1.3em 64px;
  border-bottom: 1px solid rgb(243,244,246);

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