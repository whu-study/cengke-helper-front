<template>
  <n-collapse default-expanded-names="1" accordion>
    <n-collapse-item title="信息学部" name="1">
      <div>Python</div>
    </n-collapse-item>
    <n-collapse-item title="文理学部" name="2">
      <div>Java</div>
    </n-collapse-item>

    <n-collapse-item title="工学部" name="3">
      <div>Java</div>
    </n-collapse-item>

    <n-collapse-item title="医学部" name="4">
      <div>Java</div>
    </n-collapse-item>
  </n-collapse>
</template>
<script setup lang="ts">


</script>

<style scoped lang="scss">

:deep(.n-collapse-item__header) {
  padding: 0 !important;
  margin: 0 !important;
}

:deep(.n-collapse-item__header-main) {
  background: #dda15e;
  border: #bc6c25 2px solid;
  font-size: 5vw;
  //margin-bottom: 1%;
  //height: 5vw;
}

:deep(.n-collapse-item__content-inner) {
  padding: 0;
  margin: 0;
  background: #dda15e;
}

</style>