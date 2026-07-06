<script setup lang="ts">
// Typewriter-caret "composing" animation, ported from css-decode/animations
// (TypingStickman): a monospace line that types out and back with a blinking caret.
withDefaults(defineProps<{ text?: string }>(), { text: 'typing a message…' })
</script>

<template>
  <span class="typing-stickman">{{ text }}</span>
</template>

<style scoped>
.typing-stickman {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  border-right: 2px solid currentColor;
  font-family: monospace;
  font-size: 13px;
  animation:
    stickmanTyping 4s steps(24, end) infinite,
    stickmanBlink 0.6s step-end infinite;
}
@keyframes stickmanTyping {
  0%,
  10% {
    width: 0;
  }
  50%,
  70% {
    width: 100%;
  }
  85%,
  100% {
    width: 0;
  }
}
@keyframes stickmanBlink {
  50% {
    border-color: transparent;
  }
}
@media (prefers-reduced-motion: reduce) {
  .typing-stickman {
    width: auto;
    animation: none;
  }
}
</style>
