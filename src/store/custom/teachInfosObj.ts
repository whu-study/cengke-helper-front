import {ref} from "vue";
import {Items} from "@/types/Items";
import {webGetTeachInfos} from "@/api/req.ts";
import {teachInfosCacheKey} from "@/api/globalConst.ts";

export const globalDepartments = ref<string[]>([
    "文理学部",
    "工学部",
    "信息学部",
    "医学部",
    "网安基地"
])

export const GlobalTeachInfosObj = (() => {
    const teachInfos =
        ref(new Map<string, Map<string, Items.TeachInfo[]>>())

    const departmentBuildingMap = ref(new Map<string, string[]>())
    // 保证地址不变，从而父传子时能够动态改变数据
    // 为此先初始化空数组
    globalDepartments.value.forEach(
        t =>
            departmentBuildingMap.value.set(t, [])
    )

    function getBuildings(department: string): string[] {
        return departmentBuildingMap.value.get(department)!
    }

    const apiErrorMsg = ref<string>('')


    function getBuildingInfosMap(department: string): Map<string, Items.TeachInfo[]> {
        return teachInfos.value.get(department) ?? new Map<string, Items.TeachInfo[]>()
    }

    function getTeachInfos(department: string, building: string): Items.TeachInfo[] {
        if (!teachInfos.value.get(department)) {
            return []
        }
        console.log(teachInfos.value.get(department)!.get(building)!)

        if (building === '') {
            return teachInfos.value
                .get(department)!
                .get(departmentBuildingMap.value.get(
                    department
                )!.at(0)!)!
        }


        return teachInfos.value.get(department)!.get(building)!
    }


    function loadGlobalTeachInfos(cacheable: boolean) {
        // console.log(teachInfos.value)
        if (cacheable) {
            let data = localStorage.getItem(teachInfosCacheKey)
            if (data != null && data != '') {
                initData(JSON.parse(data))
                return
            }
        }


        webGetTeachInfos()
            .then((data) => {
                apiErrorMsg.value = ''
                if (data.length != 5) {
                    console.log("断言失败，数据长度应当为5！")
                    apiErrorMsg.value = '数据长度不为5'
                    return
                }

                localStorage.setItem(teachInfosCacheKey, JSON.stringify(data))
                console.log("get teach infos from api")

                initData(data)
            })
            .catch((err) => {
                apiErrorMsg.value = '获取教学信息失败' + err
                console.log(err)
            })
    }

    const initData = (data: Items.BuildingTeachInfos[][]) => {
        for (let i = 0; i < 5; i++) {

            let tempMap = new Map<string, Items.TeachInfo[]>()

            data[i].forEach(t => {
                tempMap.set(t.building, t.infos)
            })

            teachInfos.value.set(globalDepartments.value[i], tempMap)

            Array.from(tempMap.keys()).forEach(t =>
                departmentBuildingMap.value
                    .get(
                        globalDepartments.value[i]
                    )?.push(t)
            )

        }


    }

    return {
        getBuildings,
        loadGlobalTeachInfos,
        getTeachInfos,
        getBuildingInfosMap,
        apiErrorMsg
    };
})();
