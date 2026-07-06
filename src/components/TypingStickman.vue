<script setup lang="ts">
// Live "composing" text: renders the actual message (driven by the real input
// value) and optionally a blinking caret at the end. The text span is always the
// same element, so it updates in place as the author types — no re-mount, no flash.
withDefaults(defineProps<{ text?: string; caret?: boolean }>(), { text: '', caret: true })
</script>

<template>
  <span class="typing-stickman"
    ><span class="whitespace-pre-wrap break-words">{{ text }}</span
    ><span v-if="caret" class="caret" aria-hidden="true"></span
  ></span>
</template>

<style scoped>
.typing-stickman {
  display: inline;
}
.caret {
  display: inline-block;
  width: 2px;
  height: 1.1em;
  margin-left: 1px;
  vertical-align: text-bottom;
  background: currentColor;
  animation: caretBlink 1s step-end infinite;
}
@keyframes caretBlink {
  50% {
    opacity: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .caret {
    animation: none;
  }
}
</style>
