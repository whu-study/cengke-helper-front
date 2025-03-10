import {Ref, ref} from "vue";
import {TransDef} from "@/api/myAxois.ts";
import {Items} from "@/types/Items";


export class ListModel<T> {
    total: Ref<number> = ref(0)
    nextPage: Ref<number> = ref(1)
    listModelData: Ref<T[]> = ref([])
    finished: Ref<boolean> = ref(false)

    // 初始化
    listInit() {
        this.total.value = 0
        this.nextPage.value = 1
        this.listModelData.value.length = 0
        this.finished.value = false
    }

    // true表示数据获取完毕, 是最后一次追加；false表示数据未获取完毕
    async appendListModels(
        webGetter: Promise<TransDef>,
        loopCallback: (item: T) => void) {
        return webGetter.then((res) => {
            // 获取相应数据
            const tempList = res.data as Items.PageWrapper<T>
            this.total.value = tempList.total

            console.log(this.total.value)
            console.log(this.listModelData.value)

            // 追加数据到listModelData
            tempList.list.forEach(t => {
                loopCallback(t)
                this.listModelData.value.push(t)
            })

            // 如果到这里数据获取完毕了，返回false
            if (tempList.total <= tempList.page * tempList.pageSize) {
                this.finished.value = true
                return true
            } else {
                // 还有数据需要获取,准备获取下一页
                this.nextPage.value++
                return false
            }
        })
    }
}