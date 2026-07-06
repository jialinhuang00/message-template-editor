<script setup lang="ts">
import IconGithub from '~icons/simple-icons/github'

const REPO_URL = 'https://github.com/jialinhuang00/message-template-editor'
const STACK = ['Vue 3', 'TypeScript', 'Vite', 'Tailwind CSS', 'shadcn-vue']
</script>

<template>
  <footer
    class="mt-10 flex flex-col items-center gap-2 border-t pt-6 text-xs text-muted-foreground"
  >
    <p>Powered by {{ STACK.join(' · ') }}</p>
    <a
      :href="REPO_URL"
      target="_blank"
      rel="noreferrer"
      aria-label="View source on GitHub"
      class="text-muted-foreground transition-colors hover:text-foreground"
    >
      <IconGithub class="h-5 w-5" />
    </a>
  </footer>
</template>
