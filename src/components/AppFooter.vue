<script setup lang="ts">
const REPO_URL = 'https://github.com/jialinhuang00/omnichat-template-editor'
const STACK = ['Vue 3', 'TypeScript', 'Vite', 'Tailwind CSS', 'shadcn-vue']
</script>

<template>
  <footer class="mt-10 space-y-1 border-t pt-6 text-center text-xs text-muted-foreground">
    <p>Powered by {{ STACK.join(' · ') }}</p>
    <a
      :href="REPO_URL"
      target="_blank"
      rel="noreferrer"
      class="underline underline-offset-2 hover:text-foreground"
    >
      github.com/jialinhuang00/omnichat-template-editor
    </a>
  </footer>
</template>
