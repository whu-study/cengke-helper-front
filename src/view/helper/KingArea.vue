<template>
  <div class="py-2">
    <div class="relative w-full flex gap-0 snap-x snap-mandatory overflow-x-auto scroll-smooth"
         ref="scrollContent"
         @scroll="handleScroll">

      <div class="snap-always snap-center shrink-0 first:pl-0 last:pr-0 w-[100%] mb-5"
           v-for="i in totalPage">
        <!--选择项区-->
        <el-segmented v-model="segmentIndex"
                      :options="buildings.slice((i-1)*pageSize,Math.min((i-1)*pageSize+5),buildings.length)"
                      @change="onChange">
          <template #default="scope">
            <div class="segmented-item-wrapper">
              <div class="segmented-icon">
                {{ scope.item.building[0] === '0' ? scope.item.building.slice(0, 2) : scope.item.building[0] }}
              </div>
              <div class="segmented-text">{{ scope.item.building }}</div>
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
       'bg-yellow-500':i-1===curScrollIndex,
       'bg-yellow-300':i-1!==curScrollIndex
     }" @click="onClickProcess(i-1)"></div>
      </div>
    </div>

  </div>

  <div class="course-list" :style="{ transform: `translateX(${-segmentIndex * 100}%)` }">
    <div v-for="(building,idx) in buildings" :key="idx">
      <div :class="'w-[100vw] '+className">
        <div v-for="courseInfo in building.infos">
          <CourseCard :course-info="courseInfo"/>
        </div>

        <div style="height: 3vw;"></div>
      </div>
    </div>
  </div>

</template>
<script lang="ts" setup>
import {computed, nextTick, onMounted, ref, watch} from 'vue'
import CourseCard from "@/view/helper/CourseCard.vue";
import {useCourseStore} from "@/store/modules/coursesStore";
import {toRef} from 'vue';
import type {BuildingInfo} from '@/types/course';

const props = defineProps<{
  divisionIndex: number;
}>();

const courseStore = useCourseStore();

const buildings: Ref<BuildingInfo[]> = computed(() => {
  const val = courseStore.getBuildingsByDivision(props.divisionIndex);
  console.log(val)
  let count = 0;
  val.forEach((t) => {
    t.value = count++;
  })
  return val
})

const className = ref('no' + props.divisionIndex);

const onChange = (idx: number) => {
  const clientHeight = document.getElementsByClassName(className.value).item(idx).clientHeight;
  contentHeight.value = clientHeight + 'px'
}


const scrollContent = ref()

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

const segmentIndex = ref(0)

const contentHeight = ref('1')

const currentDivisionRef = toRef(courseStore, 'currentDivision');

onMounted(() => {
  nextTick(() => {
    const element = document.getElementsByClassName(className.value).item(segmentIndex.value);
    if (element) {
      const clientHeight = element.clientHeight;
      contentHeight.value = clientHeight + 'px';
    }
  });
  watch(currentDivisionRef, () => {
    nextTick(() => {
      const element = document.getElementsByClassName(className.value).item(segmentIndex.value);
      if (element) {
        const clientHeight = element.clientHeight;
        contentHeight.value = clientHeight + 'px';
      }
    })
  });
})


</script>

<style lang="scss" scoped>

.el-segmented {
  //width: 100%;
  --el-segmented-item-selected-bg-color: #dda15e;
  //--el-segmented-item-selected-bg-color: rgba(255, 255, 255, 0);
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
    //height: 10vw;
    //color: #bc6c25;
    //border: #e8b57f 1px solid;
    //background: #e8b57f;
    //margin-left: 2vw;
    //margin-right: 2vw;
    margin-bottom: 1vw;
  }

  .segmented-text {
    color: #bc6c25;
    font-size: 3vw;
  }

}


.course-list {
  display: flex;
  //flex-direction: row;
  transition: transform 0.5s ease; /* 添加过渡效果，并使用缓动函数 */
  max-height: v-bind(contentHeight);
}
</style>