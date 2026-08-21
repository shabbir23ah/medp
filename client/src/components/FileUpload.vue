<template>
  <div
    class="file-upload"
    :class="{ 'has-file': preview }"
    @click="triggerInput"
    @dragover.prevent
    @drop.prevent="handleDrop"
  >
    <input ref="inputRef" type="file" accept="image/*" @change="handleChange" hidden />
    <input ref="cameraRef" type="file" accept="image/*" capture="environment" @change="handleChange" hidden />
    <template v-if="preview">
      <img :src="preview" alt="Preview" class="preview" />
      <button @click.stop="clear" class="clear-btn" aria-label="Remove photo">✕</button>
    </template>
    <template v-else>
      <Camera :size="28" :stroke-width="1.5" class="upload-icon" />
      <span>{{ label }}</span>
      <button type="button" class="camera-btn" @click.stop="triggerCamera">
        <Camera :size="15" :stroke-width="2" />
        Take Photo
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Camera } from 'lucide-vue-next';

const props = defineProps<{ label?: string; modelValue?: File | null }>();
const emit = defineEmits<{ 'update:modelValue': [file: File | null] }>();

const inputRef = ref<HTMLInputElement>();
const cameraRef = ref<HTMLInputElement>();
const preview = ref<string | null>(null);

function triggerInput() {
  inputRef.value?.click();
}

function triggerCamera() {
  cameraRef.value?.click();
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
  border: 2px dashed var(--border);
  border-radius: 16px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  min-height: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--text-muted);
  background: var(--bg);
}
.file-upload:hover { border-color: var(--primary); background: var(--primary-bg); }
.has-file { border-style: solid; border-color: var(--primary); padding: 0; min-height: auto; background: var(--surface); }
.preview { width: 100%; max-height: 300px; object-fit: contain; border-radius: 14px; }
.clear-btn {
  position: absolute;
  top: 10px; right: 10px;
  width: 30px; height: 30px;
  border-radius: 50%;
  background: rgba(0,0,0,0.5); color: white;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 700;
}
.clear-btn:hover { background: var(--danger); }
.upload-icon { font-size: 36px; }
.camera-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  padding: 9px 16px;
  border-radius: 10px;
  background: var(--primary-bg);
  color: var(--primary);
  font-weight: 700;
  font-size: 13px;
  transition: transform 0.15s;
}
.camera-btn:hover { transform: scale(1.03); }
</style>