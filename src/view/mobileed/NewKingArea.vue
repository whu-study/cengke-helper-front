<template>
  <div class="py-2">
    <div class="relative w-full flex gap-0 snap-x snap-mandatory overflow-x-auto scroll-smooth"
         ref="scrollContent"
         @scroll="handleScroll">


      <div class="snap-always snap-center shrink-0 first:pl-0 last:pr-0 w-[100%] mb-5"
           v-for="i in totalPage">
        <!--选择项区-->
        <el-segmented v-model="value"
                      :options="buildings.slice((i-1)*pageSize,Math.min((i-1)*pageSize+5),buildings.length)">
          <template #default="scope">
            <div class="segmented-item-wrapper">
              <div class="segmented-icon">
                  {{scope.item[0]}}
              </div>
              <div class="segmented-text">{{ scope.item }}</div>
            </div>
          </template>
        </el-segmented>
      </div>
    </div>

    <!--滑块区,进度条-->
    <div class="flex flex-row place-content-center pb-4" v-if="totalPage!==1">
      <div v-for="i in totalPage">
        <div :class="{
       'w-20 h-2 rounded ml-1 mr-1':true,
       'bg-blue-500':i-1===curScrollIndex,
       'bg-blue-200':i-1!==curScrollIndex
     }" @click="onClickProcess(i-1)"></div>
      </div>
    </div>

  </div>
</template>
<script lang="ts" setup>
import {computed, onMounted, ref} from 'vue'
import {
  Apple,
  Cherry,
  Grape,
  Orange,
  Pear,
  Watermelon,
} from '@element-plus/icons-vue'
import BuildingIcon from "@/view/mobileed/BuildingIcon.vue";

const scrollContent = ref()
const buildings = ref<string[]>([])
onMounted(() => {
  buildings.value = null || ["计11", "111", "计22", "333", "444", "555", "666", "777", "888", "999","1010"]
})

const pageSize = 5;

const totalPage = computed(() => {
  return parseInt(String(Math.ceil(buildings.value.length / pageSize))) // 向上整数
})

// 动作
const curScrollIndex = ref(0)
const handleScroll = (e: any) => {
  for (let i = 0; i < totalPage.value; i++) {
    if (parseInt(e.target.scrollLeft) <=
        e.target.scrollWidth / totalPage.value * (i + 1) - e.target.offsetWidth / 2) {
      curScrollIndex.value = i
      return
    }
  }
  // 0-size/3*1  size/3*1-size/3*2 size/3*2-size/3*3
}

const onClickProcess = (index: number) => {
  scrollContent.value.scrollLeft = scrollContent.value.scrollWidth * index / totalPage.value
}

const value = ref('计11')

</script>

<style lang="scss" scoped>

.el-segmented {
  //width: 100%;
  --el-segmented-item-selected-bg-color: #dda15e;
}

// 穿透作用域修改子组件样式
:deep(.el-segmented__item) {
  padding-left: 0;
  padding-right: 0;
}

.segmented-item-wrapper {
  width: 20vw; // 20*5=100%
  padding-top: 15%;
  line-height: 6vw;

  .segmented-icon {
    font-size: 5vw;
    align-content: center;
    vertical-align: middle;
    line-height: 5vw;
    height: 10vw;
    color: #bc6c25;
    border: #e8b57f 1px solid;
    background: #e8b57f;
    margin-left: 2vw;
    margin-right: 2vw;
    margin-bottom: 1vw;
  }

  .segmented-text {
    color: #bc6c25;
  }

}
</style>