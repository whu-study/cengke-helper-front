<script setup lang="ts">

import HelperCollapse from "@/view/helper/HelperCollapse.vue";

// 定义事件发射
const emit = defineEmits<{
  switchToFilter: []
}>();

// 透传事件
const handleSwitchToFilter = () => {
  emit('switchToFilter');
};
</script>

<template>
  <HelperCollapse @switch-to-filter="handleSwitchToFilter" />
</template>

<style scoped>

</style>