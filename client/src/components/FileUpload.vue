<template>
  <div
    class="file-upload"
    :class="{ 'has-file': preview }"
    @click="triggerInput"
    @dragover.prevent
    @drop.prevent="handleDrop"
  >
    <input ref="inputRef" type="file" accept="image/*" @change="handleChange" hidden />
    <template v-if="preview">
      <img :src="preview" alt="Preview" class="preview" />
      <button @click.stop="clear" class="clear-btn">✕</button>
    </template>
    <template v-else>
      <span class="upload-icon">📷</span>
      <span>{{ label }}</span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{ label?: string; modelValue?: File | null }>();
const emit = defineEmits<{ 'update:modelValue': [file: File | null] }>();

const inputRef = ref<HTMLInputElement>();
const preview = ref<string | null>(null);

function triggerInput() {
  inputRef.value?.click();
}

function processFile(file: File) {
  emit('update:modelValue', file);
  const reader = new FileReader();
  reader.onload = (e) => { preview.value = e.target?.result as string; };
  reader.readAsDataURL(file);
}

function handleChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) processFile(file);
}

function handleDrop(e: DragEvent) {
  const file = e.dataTransfer?.files?.[0];
  if (file) processFile(file);
}

function clear() {
  preview.value = null;
  emit('update:modelValue', null);
  if (inputRef.value) inputRef.value.value = '';
}
</script>

<style scoped>
.file-upload {
  border: 2px dashed var(--color-border);
  border-radius: var(--radius);
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s;
  position: relative;
  min-height: 150px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--color-text-muted);
}
.file-upload:hover { border-color: var(--color-primary); }
.has-file { border-style: solid; padding: 0; min-height: auto; }
.preview { width: 100%; max-height: 300px; object-fit: contain; border-radius: var(--radius); }
.clear-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(0,0,0,0.6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}
.upload-icon { font-size: 32px; }
</style>