<script setup lang="ts">
import { ref } from 'vue'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { StoredTemplate } from '@/types'

const props = defineProps<{ templates: StoredTemplate[] }>()
const emit = defineEmits<{ load: [StoredTemplate] }>()

// Bound to the Select but reset after each pick, so the placeholder returns and the
// same template can be selected again.
const selected = ref('')

function onSelect(id: string) {
  const template = props.templates.find((t) => t.id === id)
  if (template) emit('load', template)
  selected.value = ''
}
</script>

<template>
  <div class="space-y-2">
    <Label for="library">Load a saved template</Label>
    <Select
      v-if="templates.length"
      :model-value="selected"
      @update:model-value="onSelect(String($event))"
    >
      <SelectTrigger id="library" class="w-full">
        <SelectValue placeholder="Load a saved template…" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem v-for="t in templates" :key="t.id" :value="t.id">
          {{ t.name || '(untitled)' }} · {{ t.channel }}
        </SelectItem>
      </SelectContent>
    </Select>
    <Select v-else disabled>
      <SelectTrigger id="library" class="w-full">
        <SelectValue placeholder="No saved templates yet" />
      </SelectTrigger>
    </Select>
  </div>
</template>
