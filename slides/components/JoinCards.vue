<script setup lang="ts">
defineProps<{ steps?: boolean }>()
</script>

<template>
  <div class="join-grid" :class="{ 'join-compact': !steps }">
    <div class="join-card">
      <div class="join-head"><span v-if="steps" class="join-num">1</span>Join the WiFi</div>
      <div class="join-cap">Network</div>
      <div class="join-val">{{ $slidev.configs.wifiNetwork }}</div>
      <div class="join-cap">Password</div>
      <div class="join-val">{{ $slidev.configs.wifiPassword }}</div>
    </div>
    <div class="join-card">
      <div class="join-head"><span v-if="steps" class="join-num">2</span>Open in your browser</div>
      <span class="cta join-url">{{ $slidev.configs.gameUrl }}</span>
      <div class="join-cap">or http://{{ $slidev.configs.gameIp }}</div>
    </div>
    <template v-if="steps">
      <div class="join-card join-small"><span class="join-num">3</span>Pick a name and an avatar</div>
      <div class="join-card join-small"><span class="join-num">4</span>Wait for the start signal</div>
    </template>
  </div>
</template>
