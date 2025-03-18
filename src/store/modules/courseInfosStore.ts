import { defineStore } from 'pinia';
import axios from 'axios';

// 课程信息接口
export interface CourseInfo {
    room: string;
    faculty: string;
    courseName: string;
    teacherName: string;
    teacherTitle: string;
    courseTime: string;
    courseType: string;
}

// 教学楼信息接口
export interface BuildingInfo {
    building: string;
    label: string;
    value: number;
    infos: CourseInfo[];
}

// 学部信息接口（假设最外层数组每个元素是一个学部）
interface DivisionInfo {
    [key: number]: BuildingInfo[];
}

export const useCourseStore = defineStore('course', {
    state: () => ({
        courseData: {
            0: [],
            1: [],
            2: [],
            3: []
        } as DivisionInfo,
        // 新增一个 Map 用于存储教学楼和课程信息的映射
        buildingCourseMap: new Map<string, CourseInfo[]>(),
        isLoading: false,
        error: null as string | null,
        _currentDivision: 0
    }),
    getters: {
        // 获取当前学部信息的 getter 方法
        currentDivision: (state) => state._currentDivision
    },
    actions: {
        async fetchCourseData() {
            this.isLoading = true;
            try {
                const response = {
                    data: JSON.parse('[\n' +
                        '  [\n' +
                        '    {\n' +
                        '      "building": "2-教学楼",\n' +
                        '      "infos": [\n' +
                        '        {\n' +
                        '          "room": "202",\n' +
                        '          "faculty": "化学与分子科学学院",\n' +
                        '          "courseName": "分子模拟实验",\n' +
                        '          "teacherName": "侯华",\n' +
                        '          "teacherTitle": "副教授",\n' +
                        '          "courseTime": "第 1-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        }\n' +
                        '      ]\n' +
                        '    },\n' +
                        '    {\n' +
                        '      "building": "3-教学楼",\n' +
                        '      "infos": [\n' +
                        '        {\n' +
                        '          "room": "101",\n' +
                        '          "faculty": "信息管理学院",\n' +
                        '          "courseName": "信息服务与用户",\n' +
                        '          "teacherName": "邓胜利",\n' +
                        '          "teacherTitle": "教授",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "301",\n' +
                        '          "faculty": "社会学院",\n' +
                        '          "courseName": "组织社会学",\n' +
                        '          "teacherName": "仇叶",\n' +
                        '          "teacherTitle": "副教授",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "401",\n' +
                        '          "faculty": "信息管理学院",\n' +
                        '          "courseName": "图书馆与信息中心管理",\n' +
                        '          "teacherName": "周力虹",\n' +
                        '          "teacherTitle": "教授",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "403",\n' +
                        '          "faculty": "经济与管理学院",\n' +
                        '          "courseName": "财务会计",\n' +
                        '          "teacherName": "李晓蹊",\n' +
                        '          "teacherTitle": "副教授",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "501",\n' +
                        '          "faculty": "物理科学与技术学院",\n' +
                        '          "courseName": "普通物理四",\n' +
                        '          "teacherName": "陈志权",\n' +
                        '          "teacherTitle": "教授",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "502",\n' +
                        '          "faculty": "文学院",\n' +
                        '          "courseName": "现代语言学",\n' +
                        '          "teacherName": "杨旭",\n' +
                        '          "teacherTitle": "",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        }\n' +
                        '      ]\n' +
                        '    },\n' +
                        '    {\n' +
                        '      "building": "5-教学楼",\n' +
                        '      "infos": [\n' +
                        '        {\n' +
                        '          "room": "101",\n' +
                        '          "faculty": "历史学院",\n' +
                        '          "courseName": "中国史（上）",\n' +
                        '          "teacherName": "郑威",\n' +
                        '          "teacherTitle": "教授",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "304",\n' +
                        '          "faculty": "物理科学与技术学院",\n' +
                        '          "courseName": "普通物理四",\n' +
                        '          "teacherName": "于霆",\n' +
                        '          "teacherTitle": "教授",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "308",\n' +
                        '          "faculty": "化学与分子科学学院",\n' +
                        '          "courseName": "高分子物理",\n' +
                        '          "teacherName": "蔡杰",\n' +
                        '          "teacherTitle": "教授",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "310",\n' +
                        '          "faculty": "化学与分子科学学院",\n' +
                        '          "courseName": "高分子物理",\n' +
                        '          "teacherName": "许小娟",\n' +
                        '          "teacherTitle": "教授",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "401",\n' +
                        '          "faculty": "政治与公共管理学院",\n' +
                        '          "courseName": "政治人类学",\n' +
                        '          "teacherName": "杜姣",\n' +
                        '          "teacherTitle": "副教授",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "402",\n' +
                        '          "faculty": "生命科学学院",\n' +
                        '          "courseName": "生物化学（上）",\n' +
                        '          "teacherName": "黄赞",\n' +
                        '          "teacherTitle": "教授",\n' +
                        '          "courseTime": "第 3-4 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "407",\n' +
                        '          "faculty": "经济与管理学院",\n' +
                        '          "courseName": "微观经济学",\n' +
                        '          "teacherName": "李旭超",\n' +
                        '          "teacherTitle": "副教授",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "409",\n' +
                        '          "faculty": "经济与管理学院",\n' +
                        '          "courseName": "服务营销",\n' +
                        '          "teacherName": "徐岚",\n' +
                        '          "teacherTitle": "教授",\n' +
                        '          "courseTime": "第 1-3 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "502",\n' +
                        '          "faculty": "政治与公共管理学院",\n' +
                        '          "courseName": "劳动经济学",\n' +
                        '          "teacherName": "黄汝婷",\n' +
                        '          "teacherTitle": "",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "507",\n' +
                        '          "faculty": "经济与管理学院",\n' +
                        '          "courseName": "微观经济学",\n' +
                        '          "teacherName": "罗知",\n' +
                        '          "teacherTitle": "教授",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "513",\n' +
                        '          "faculty": "经济与管理学院",\n' +
                        '          "courseName": "中级宏微观经济学",\n' +
                        '          "teacherName": "刘岩",\n' +
                        '          "teacherTitle": "副教授",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "515",\n' +
                        '          "faculty": "马克思主义学院",\n' +
                        '          "courseName": "当代中国政府与政治",\n' +
                        '          "teacherName": "周迪",\n' +
                        '          "teacherTitle": "讲师",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "516",\n' +
                        '          "faculty": "哲学学院",\n' +
                        '          "courseName": "语言哲学",\n' +
                        '          "teacherName": "Peter William Finocchiaro",\n' +
                        '          "teacherTitle": "",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "520",\n' +
                        '          "faculty": "马克思主义学院",\n' +
                        '          "courseName": "思想政治教育心理学",\n' +
                        '          "teacherName": "陈武",\n' +
                        '          "teacherTitle": "副教授",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        }\n' +
                        '      ]\n' +
                        '    },\n' +
                        '    {\n' +
                        '      "building": "法-教学楼",\n' +
                        '      "infos": [\n' +
                        '        {\n' +
                        '          "room": "119",\n' +
                        '          "faculty": "法学院",\n' +
                        '          "courseName": "中国法制史",\n' +
                        '          "teacherName": "付春杨",\n' +
                        '          "teacherTitle": "副教授",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        }\n' +
                        '      ]\n' +
                        '    },\n' +
                        '    {\n' +
                        '      "building": "理-教学楼",\n' +
                        '      "infos": [\n' +
                        '        {\n' +
                        '          "room": "104",\n' +
                        '          "faculty": "数学与统计学院",\n' +
                        '          "courseName": "运筹学",\n' +
                        '          "teacherName": "王艳",\n' +
                        '          "teacherTitle": "讲师",\n' +
                        '          "courseTime": "第 3-4 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "105",\n' +
                        '          "faculty": "新闻与传播学院",\n' +
                        '          "courseName": "现代广告学",\n' +
                        '          "teacherName": "余晓莉",\n' +
                        '          "teacherTitle": "副教授",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "202",\n' +
                        '          "faculty": "信息管理学院",\n' +
                        '          "courseName": "信息检索",\n' +
                        '          "teacherName": "刘萍",\n' +
                        '          "teacherTitle": "教授",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "203",\n' +
                        '          "faculty": "信息管理学院",\n' +
                        '          "courseName": "信息检索",\n' +
                        '          "teacherName": "黄颖",\n' +
                        '          "teacherTitle": "副教授",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "207",\n' +
                        '          "faculty": "数学与统计学院",\n' +
                        '          "courseName": "黎曼几何",\n' +
                        '          "teacherName": "陈群",\n' +
                        '          "teacherTitle": "教授",\n' +
                        '          "courseTime": "第 3-4 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "208",\n' +
                        '          "faculty": "社会学院",\n' +
                        '          "courseName": "家庭社会学",\n' +
                        '          "teacherName": "杨华",\n' +
                        '          "teacherTitle": "教授",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "304",\n' +
                        '          "faculty": "哲学学院",\n' +
                        '          "courseName": "宗教社会学",\n' +
                        '          "teacherName": "黄超",\n' +
                        '          "teacherTitle": "副教授",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "305",\n' +
                        '          "faculty": "历史学院",\n' +
                        '          "courseName": "古陶瓷工艺学",\n' +
                        '          "teacherName": "李清临",\n' +
                        '          "teacherTitle": "副教授",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        }\n' +
                        '      ]\n' +
                        '    },\n' +
                        '    {\n' +
                        '      "building": "计-教学楼",\n' +
                        '      "infos": [\n' +
                        '        {\n' +
                        '          "room": "202",\n' +
                        '          "faculty": "信息管理学院",\n' +
                        '          "courseName": "信息检索",\n' +
                        '          "teacherName": "黄如花",\n' +
                        '          "teacherTitle": "教授",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        }\n' +
                        '      ]\n' +
                        '    },\n' +
                        '    {\n' +
                        '      "building": "1-教学楼",\n' +
                        '      "infos": [\n' +
                        '        {\n' +
                        '          "room": "101",\n' +
                        '          "faculty": "信息管理学院",\n' +
                        '          "courseName": "电子文件管理",\n' +
                        '          "teacherName": "王平",\n' +
                        '          "teacherTitle": "教授",\n' +
                        '          "courseTime": "第 1-3 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "201",\n' +
                        '          "faculty": "物理科学与技术学院",\n' +
                        '          "courseName": "光学",\n' +
                        '          "teacherName": "张顺平",\n' +
                        '          "teacherTitle": "教授",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "205",\n' +
                        '          "faculty": "公共数学教学",\n' +
                        '          "courseName": "数值分析",\n' +
                        '          "teacherName": "邹秀芬",\n' +
                        '          "teacherTitle": "教授",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "辅修课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "303",\n' +
                        '          "faculty": "历史学院",\n' +
                        '          "courseName": "世界通史(一)",\n' +
                        '          "teacherName": "何元国",\n' +
                        '          "teacherTitle": "教授",\n' +
                        '          "courseTime": "第 1-3 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        }\n' +
                        '      ]\n' +
                        '    },\n' +
                        '    {\n' +
                        '      "building": "4-教学楼",\n' +
                        '      "infos": [\n' +
                        '        {\n' +
                        '          "room": "102",\n' +
                        '          "faculty": "文学院",\n' +
                        '          "courseName": "新生导学",\n' +
                        '          "teacherName": "裴亮",\n' +
                        '          "teacherTitle": "副教授",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "203",\n' +
                        '          "faculty": "文学院",\n' +
                        '          "courseName": "中国古代文学史（3）",\n' +
                        '          "teacherName": "王启玮",\n' +
                        '          "teacherTitle": "",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "204",\n' +
                        '          "faculty": "通识教育中心",\n' +
                        '          "courseName": "人文社科经典导引",\n' +
                        '          "teacherName": "待定",\n' +
                        '          "teacherTitle": "",\n' +
                        '          "courseTime": "第 3-4 节",\n' +
                        '          "courseType": "通识选修课"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "205",\n' +
                        '          "faculty": "通识教育中心",\n' +
                        '          "courseName": "人文社科经典导引",\n' +
                        '          "teacherName": "待定",\n' +
                        '          "teacherTitle": "",\n' +
                        '          "courseTime": "第 3-4 节",\n' +
                        '          "courseType": "通识选修课"\n' +
                        '        }\n' +
                        '      ]\n' +
                        '    },\n' +
                        '    {\n' +
                        '      "building": "6-教学楼",\n' +
                        '      "infos": [\n' +
                        '        {\n' +
                        '          "room": "103",\n' +
                        '          "faculty": "文学院",\n' +
                        '          "courseName": "鲁迅研读",\n' +
                        '          "teacherName": "孙大坤",\n' +
                        '          "teacherTitle": "",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "202",\n' +
                        '          "faculty": "大学英语部",\n' +
                        '          "courseName": "高级交际英语1",\n' +
                        '          "teacherName": "徐丽",\n' +
                        '          "teacherTitle": "讲师",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "208",\n' +
                        '          "faculty": "大学英语部",\n' +
                        '          "courseName": "高级交际英语1",\n' +
                        '          "teacherName": "GARRETTSETHERNEST",\n' +
                        '          "teacherTitle": "",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "301",\n' +
                        '          "faculty": "经济与管理学院",\n' +
                        '          "courseName": "微观经济学",\n' +
                        '          "teacherName": "逄金栋",\n' +
                        '          "teacherTitle": "",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "307",\n' +
                        '          "faculty": "经济与管理学院",\n' +
                        '          "courseName": "微观经济学",\n' +
                        '          "teacherName": "杨冕",\n' +
                        '          "teacherTitle": "教授",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "308",\n' +
                        '          "faculty": "政治与公共管理学院",\n' +
                        '          "courseName": "非政府组织管理",\n' +
                        '          "teacherName": "高娟",\n' +
                        '          "teacherTitle": "副教授",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        }\n' +
                        '      ]\n' +
                        '    },\n' +
                        '    {\n' +
                        '      "building": "新外-教学楼",\n' +
                        '      "infos": [\n' +
                        '        {\n' +
                        '          "room": "06",\n' +
                        '          "faculty": "外国语言文学学院",\n' +
                        '          "courseName": "高级俄语（1）",\n' +
                        '          "teacherName": "乐音",\n' +
                        '          "teacherTitle": "讲师",\n' +
                        '          "courseTime": "第 3-4 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "07",\n' +
                        '          "faculty": "外国语言文学学院",\n' +
                        '          "courseName": "英汉口译",\n' +
                        '          "teacherName": "戴丹妮",\n' +
                        '          "teacherTitle": "副教授",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "08",\n' +
                        '          "faculty": "外国语言文学学院",\n' +
                        '          "courseName": "高级俄语口译（创）",\n' +
                        '          "teacherName": "张鸿彦",\n' +
                        '          "teacherTitle": "副教授",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "09",\n' +
                        '          "faculty": "外国语言文学学院",\n' +
                        '          "courseName": "英美文学（I）",\n' +
                        '          "teacherName": "张国庆",\n' +
                        '          "teacherTitle": "教授",\n' +
                        '          "courseTime": "第 3-4 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "11",\n' +
                        '          "faculty": "外国语言文学学院",\n' +
                        '          "courseName": "法语写作（1）",\n' +
                        '          "teacherName": "法语外教M",\n' +
                        '          "teacherTitle": "副教授",\n' +
                        '          "courseTime": "第 3-4 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "15",\n' +
                        '          "faculty": "外国语言文学学院",\n' +
                        '          "courseName": "德语文学选读（1）",\n' +
                        '          "teacherName": "谢芳",\n' +
                        '          "teacherTitle": "教授",\n' +
                        '          "courseTime": "第 3-4 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "17",\n' +
                        '          "faculty": "外国语言文学学院",\n' +
                        '          "courseName": "应用语言学",\n' +
                        '          "teacherName": "卢晓仙",\n' +
                        '          "teacherTitle": "副教授",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "18",\n' +
                        '          "faculty": "外国语言文学学院",\n' +
                        '          "courseName": "西方文学理论和批评",\n' +
                        '          "teacherName": "张国庆",\n' +
                        '          "teacherTitle": "教授",\n' +
                        '          "courseTime": "第 3-4 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        }\n' +
                        '      ]\n' +
                        '    },\n' +
                        '    {\n' +
                        '      "building": "枫-教学楼",\n' +
                        '      "infos": [\n' +
                        '        {\n' +
                        '          "room": "106",\n' +
                        '          "faculty": "经济与管理学院",\n' +
                        '          "courseName": "中级公共经济学",\n' +
                        '          "teacherName": "熊波",\n' +
                        '          "teacherTitle": "副教授",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "201",\n' +
                        '          "faculty": "国际教育学院",\n' +
                        '          "courseName": "中级听力I",\n' +
                        '          "teacherName": "周西宁",\n' +
                        '          "teacherTitle": "讲师",\n' +
                        '          "courseTime": "第 3-4 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "203",\n' +
                        '          "faculty": "信息管理学院",\n' +
                        '          "courseName": "数字娱乐产品设计（理论）",\n' +
                        '          "teacherName": "张晋朝",\n' +
                        '          "teacherTitle": "副教授",\n' +
                        '          "courseTime": "第 1-3 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "218",\n' +
                        '          "faculty": "经济与管理学院",\n' +
                        '          "courseName": "保险精算基础",\n' +
                        '          "teacherName": "李伶俐",\n' +
                        '          "teacherTitle": "副教授",\n' +
                        '          "courseTime": "第 1-3 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "318",\n' +
                        '          "faculty": "信息管理学院",\n' +
                        '          "courseName": "数据治理",\n' +
                        '          "teacherName": "陈君",\n' +
                        '          "teacherTitle": "教授",\n' +
                        '          "courseTime": "第 1-3 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        }\n' +
                        '      ]\n' +
                        '    }\n' +
                        '  ],\n' +
                        '  [\n' +
                        '    {\n' +
                        '      "building": "5-教学楼",\n' +
                        '      "infos": [\n' +
                        '        {\n' +
                        '          "room": "113",\n' +
                        '          "faculty": "公共物理教学",\n' +
                        '          "courseName": "大学物理B（下）",\n' +
                        '          "teacherName": "晏宁",\n' +
                        '          "teacherTitle": "教授",\n' +
                        '          "courseTime": "第 3-4 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "203",\n' +
                        '          "faculty": "公共物理教学",\n' +
                        '          "courseName": "大学物理B（下）",\n' +
                        '          "teacherName": "程莉",\n' +
                        '          "teacherTitle": "讲师",\n' +
                        '          "courseTime": "第 3-4 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "311",\n' +
                        '          "faculty": "电气与自动化学院",\n' +
                        '          "courseName": "电机与运动控制系统",\n' +
                        '          "teacherName": "专祥涛",\n' +
                        '          "teacherTitle": "教授",\n' +
                        '          "courseTime": "第 3-4 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        }\n' +
                        '      ]\n' +
                        '    },\n' +
                        '    {\n' +
                        '      "building": "A-教学楼",\n' +
                        '      "infos": [\n' +
                        '        {\n' +
                        '          "room": "103",\n' +
                        '          "faculty": "水利水电学院",\n' +
                        '          "courseName": "现代数值模拟方法",\n' +
                        '          "teacherName": "王桥",\n' +
                        '          "teacherTitle": "副教授",\n' +
                        '          "courseTime": "第 3-4 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "115",\n' +
                        '          "faculty": "电气与自动化学院",\n' +
                        '          "courseName": "电力电子技术",\n' +
                        '          "teacherName": "陈剑飞",\n' +
                        '          "teacherTitle": "教授",\n' +
                        '          "courseTime": "第 3-4 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "205",\n' +
                        '          "faculty": "水利水电学院",\n' +
                        '          "courseName": "水利工程智能建造",\n' +
                        '          "teacherName": "严鹏",\n' +
                        '          "teacherTitle": "教授",\n' +
                        '          "courseTime": "第 3-4 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "215",\n' +
                        '          "faculty": "泰康医学院(基础医学院)",\n' +
                        '          "courseName": "生物化学",\n' +
                        '          "teacherName": "喻红",\n' +
                        '          "teacherTitle": "教授",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "217",\n' +
                        '          "faculty": "艺术学院",\n' +
                        '          "courseName": "影视编剧（1）",\n' +
                        '          "teacherName": "杨红菊",\n' +
                        '          "teacherTitle": "副教授",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "218",\n' +
                        '          "faculty": "土木建筑工程学院",\n' +
                        '          "courseName": "环境岩土工程",\n' +
                        '          "teacherName": "郑俊杰",\n' +
                        '          "teacherTitle": "",\n' +
                        '          "courseTime": "第 3-4 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "220",\n' +
                        '          "faculty": "大学英语部",\n' +
                        '          "courseName": "大学交际英语3",\n' +
                        '          "teacherName": "待定",\n' +
                        '          "teacherTitle": "",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "英语"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "415",\n' +
                        '          "faculty": "土木建筑工程学院",\n' +
                        '          "courseName": "现代力学前沿",\n' +
                        '          "teacherName": "尹颢",\n' +
                        '          "teacherTitle": "副教授",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "416",\n' +
                        '          "faculty": "土木建筑工程学院",\n' +
                        '          "courseName": "建筑信息化及其应用",\n' +
                        '          "teacherName": "高睿",\n' +
                        '          "teacherTitle": "教授",\n' +
                        '          "courseTime": "第 3-4 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "506",\n' +
                        '          "faculty": "水利水电学院",\n' +
                        '          "courseName": "水文水利计算",\n' +
                        '          "teacherName": "周研来",\n' +
                        '          "teacherTitle": "教授",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "508",\n' +
                        '          "faculty": "电气与自动化学院",\n' +
                        '          "courseName": "电力电子技术",\n' +
                        '          "teacherName": "宫金武",\n' +
                        '          "teacherTitle": "副教授",\n' +
                        '          "courseTime": "第 3-4 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "509",\n' +
                        '          "faculty": "动力与机械学院",\n' +
                        '          "courseName": "测试技术",\n' +
                        '          "teacherName": "冯朝",\n' +
                        '          "teacherTitle": "",\n' +
                        '          "courseTime": "第 3-4 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "601",\n' +
                        '          "faculty": "电气与自动化学院",\n' +
                        '          "courseName": "电力电子技术",\n' +
                        '          "teacherName": "秦亮",\n' +
                        '          "teacherTitle": "副教授",\n' +
                        '          "courseTime": "第 3-4 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "606",\n' +
                        '          "faculty": "公共化学教学",\n' +
                        '          "courseName": "物理化学B",\n' +
                        '          "teacherName": "詹晖",\n' +
                        '          "teacherTitle": "研究员",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        }\n' +
                        '      ]\n' +
                        '    },\n' +
                        '    {\n' +
                        '      "building": "4-教学楼",\n' +
                        '      "infos": [\n' +
                        '        {\n' +
                        '          "room": "106",\n' +
                        '          "faculty": "水利水电学院",\n' +
                        '          "courseName": "水资源规划与管理",\n' +
                        '          "teacherName": "艾学山",\n' +
                        '          "teacherTitle": "副教授",\n' +
                        '          "courseTime": "第 3-4 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "109",\n' +
                        '          "faculty": "城市设计学院",\n' +
                        '          "courseName": "建筑专题设计",\n' +
                        '          "teacherName": "Penny Lewis",\n' +
                        '          "teacherTitle": "教授",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        }\n' +
                        '      ]\n' +
                        '    }\n' +
                        '  ],\n' +
                        '  [\n' +
                        '    {\n' +
                        '      "building": "附3-教学楼",\n' +
                        '      "infos": [\n' +
                        '        {\n' +
                        '          "room": "203",\n' +
                        '          "faculty": "测绘学院",\n' +
                        '          "courseName": "C/C++程序设计",\n' +
                        '          "teacherName": "罗佳",\n' +
                        '          "teacherTitle": "教授",\n' +
                        '          "courseTime": "第 3-4 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "301",\n' +
                        '          "faculty": "电子信息学院",\n' +
                        '          "courseName": "通信原理",\n' +
                        '          "teacherName": "吴静",\n' +
                        '          "teacherTitle": "副教授",\n' +
                        '          "courseTime": "第 3-4 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "303",\n' +
                        '          "faculty": "电子信息学院",\n' +
                        '          "courseName": "数字信号处理",\n' +
                        '          "teacherName": "余磊",\n' +
                        '          "teacherTitle": "教授",\n' +
                        '          "courseTime": "第 3-4 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "401",\n' +
                        '          "faculty": "遥感信息工程学院",\n' +
                        '          "courseName": "摄影测量学",\n' +
                        '          "teacherName": "赵双明",\n' +
                        '          "teacherTitle": "教授",\n' +
                        '          "courseTime": "第 1-3 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "402",\n' +
                        '          "faculty": "公共政治教学",\n' +
                        '          "courseName": "毛泽东思想和中国特色社会主义理论体系概论",\n' +
                        '          "teacherName": "吴向伟",\n' +
                        '          "teacherTitle": "副教授",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "403",\n' +
                        '          "faculty": "电子信息学院",\n' +
                        '          "courseName": "数字信号处理",\n' +
                        '          "teacherName": "王才军",\n' +
                        '          "teacherTitle": "讲师",\n' +
                        '          "courseTime": "第 3-4 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        }\n' +
                        '      ]\n' +
                        '    },\n' +
                        '    {\n' +
                        '      "building": "1-教学楼",\n' +
                        '      "infos": [\n' +
                        '        {\n' +
                        '          "room": "121",\n' +
                        '          "faculty": "资源与环境科学学院",\n' +
                        '          "courseName": "自然地理学",\n' +
                        '          "teacherName": "郑永宏",\n' +
                        '          "teacherTitle": "副教授",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "208",\n' +
                        '          "faculty": "大学英语部",\n' +
                        '          "courseName": "大学交际英语3",\n' +
                        '          "teacherName": "待定",\n' +
                        '          "teacherTitle": "",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "英语"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "217",\n' +
                        '          "faculty": "测绘学院",\n' +
                        '          "courseName": "C/C++程序设计",\n' +
                        '          "teacherName": "虞晖",\n' +
                        '          "teacherTitle": "副教授",\n' +
                        '          "courseTime": "第 2-3 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "224",\n' +
                        '          "faculty": "测绘学院",\n' +
                        '          "courseName": "C/C++程序设计",\n' +
                        '          "teacherName": "章迪",\n' +
                        '          "teacherTitle": "教授级高级实验师",\n' +
                        '          "courseTime": "第 2-3 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "304",\n' +
                        '          "faculty": "资源与环境科学学院",\n' +
                        '          "courseName": "地理信息科学研究进展",\n' +
                        '          "teacherName": "艾廷华",\n' +
                        '          "teacherTitle": "教授",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "310",\n' +
                        '          "faculty": "计算机学院",\n' +
                        '          "courseName": "数字图像处理及应用",\n' +
                        '          "teacherName": "王增茂",\n' +
                        '          "teacherTitle": "副教授",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "313",\n' +
                        '          "faculty": "大学英语部",\n' +
                        '          "courseName": "高级交际英语",\n' +
                        '          "teacherName": "待定",\n' +
                        '          "teacherTitle": "",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "英语"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "319",\n' +
                        '          "faculty": "大学英语部",\n' +
                        '          "courseName": "高级交际英语",\n' +
                        '          "teacherName": "待定",\n' +
                        '          "teacherTitle": "",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "英语"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "320",\n' +
                        '          "faculty": "大学英语部",\n' +
                        '          "courseName": "高级交际英语",\n' +
                        '          "teacherName": "待定",\n' +
                        '          "teacherTitle": "",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "英语"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "321",\n' +
                        '          "faculty": "资源与环境科学学院",\n' +
                        '          "courseName": "经济地理学",\n' +
                        '          "teacherName": "何建华",\n' +
                        '          "teacherTitle": "教授",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "326",\n' +
                        '          "faculty": "大学英语部",\n' +
                        '          "courseName": "高级交际英语",\n' +
                        '          "teacherName": "待定",\n' +
                        '          "teacherTitle": "",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "英语"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "405",\n' +
                        '          "faculty": "大学英语部",\n' +
                        '          "courseName": "大学交际英语3",\n' +
                        '          "teacherName": "待定",\n' +
                        '          "teacherTitle": "",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "英语"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "410",\n' +
                        '          "faculty": "电子信息学院",\n' +
                        '          "courseName": "数字信号处理",\n' +
                        '          "teacherName": "张海剑",\n' +
                        '          "teacherTitle": "副教授",\n' +
                        '          "courseTime": "第 3-4 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "413",\n' +
                        '          "faculty": "大学英语部",\n' +
                        '          "courseName": "大学交际英语3",\n' +
                        '          "teacherName": "待定",\n' +
                        '          "teacherTitle": "",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "英语"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "419",\n' +
                        '          "faculty": "电子信息学院",\n' +
                        '          "courseName": "数字信号处理",\n' +
                        '          "teacherName": "杨文",\n' +
                        '          "teacherTitle": "教授",\n' +
                        '          "courseTime": "第 3-4 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "420",\n' +
                        '          "faculty": "电子信息学院",\n' +
                        '          "courseName": "通信原理",\n' +
                        '          "teacherName": "贺晓帆",\n' +
                        '          "teacherTitle": "教授",\n' +
                        '          "courseTime": "第 3-4 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "425",\n' +
                        '          "faculty": "公共数学教学",\n' +
                        '          "courseName": "概率论与数理统计A",\n' +
                        '          "teacherName": "钟六一",\n' +
                        '          "teacherTitle": "副教授",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "426",\n' +
                        '          "faculty": "电子信息学院",\n' +
                        '          "courseName": "数字信号处理",\n' +
                        '          "teacherName": "龚韵",\n' +
                        '          "teacherTitle": "教授",\n' +
                        '          "courseTime": "第 3-4 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "505",\n' +
                        '          "faculty": "大学英语部",\n' +
                        '          "courseName": "大学交际英语3",\n' +
                        '          "teacherName": "待定",\n' +
                        '          "teacherTitle": "",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "英语"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "516",\n' +
                        '          "faculty": "大学英语部",\n' +
                        '          "courseName": "大学交际英语3",\n' +
                        '          "teacherName": "待定",\n' +
                        '          "teacherTitle": "",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "英语"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "518",\n' +
                        '          "faculty": "大学英语部",\n' +
                        '          "courseName": "大学交际英语3",\n' +
                        '          "teacherName": "待定",\n' +
                        '          "teacherTitle": "",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "英语"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "615",\n' +
                        '          "faculty": "大学英语部",\n' +
                        '          "courseName": "大学交际英语3",\n' +
                        '          "teacherName": "待定",\n' +
                        '          "teacherTitle": "",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "英语"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "616",\n' +
                        '          "faculty": "大学英语部",\n' +
                        '          "courseName": "大学交际英语3",\n' +
                        '          "teacherName": "待定",\n' +
                        '          "teacherTitle": "",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "英语"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "618",\n' +
                        '          "faculty": "大学英语部",\n' +
                        '          "courseName": "大学交际英语3",\n' +
                        '          "teacherName": "待定",\n' +
                        '          "teacherTitle": "",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "英语"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "625",\n' +
                        '          "faculty": "计算机学院",\n' +
                        '          "courseName": "人机交互",\n' +
                        '          "teacherName": "何璐璐",\n' +
                        '          "teacherTitle": "讲师",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "628",\n' +
                        '          "faculty": "大学英语部",\n' +
                        '          "courseName": "大学交际英语3",\n' +
                        '          "teacherName": "待定",\n' +
                        '          "teacherTitle": "",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "英语"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "701",\n' +
                        '          "faculty": "资源与环境科学学院",\n' +
                        '          "courseName": "国土资源与区域发展",\n' +
                        '          "teacherName": "孔雪松",\n' +
                        '          "teacherTitle": "教授",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "702",\n' +
                        '          "faculty": "通识教育中心",\n' +
                        '          "courseName": "中国精神导引",\n' +
                        '          "teacherName": "待定",\n' +
                        '          "teacherTitle": "",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "通识选修课"\n' +
                        '        }\n' +
                        '      ]\n' +
                        '    },\n' +
                        '    {\n' +
                        '      "building": "2-教学楼",\n' +
                        '      "infos": [\n' +
                        '        {\n' +
                        '          "room": "101",\n' +
                        '          "faculty": "测绘学院",\n' +
                        '          "courseName": "测绘学概论",\n' +
                        '          "teacherName": "王正涛",\n' +
                        '          "teacherTitle": "教授",\n' +
                        '          "courseTime": "第 3-4 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "113",\n' +
                        '          "faculty": "测绘学院",\n' +
                        '          "courseName": "C/C++程序设计",\n' +
                        '          "teacherName": "陈华",\n' +
                        '          "teacherTitle": "副教授",\n' +
                        '          "courseTime": "第 2-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "205",\n' +
                        '          "faculty": "资源与环境科学学院",\n' +
                        '          "courseName": "中国地理",\n' +
                        '          "teacherName": "赵曦",\n' +
                        '          "teacherTitle": "副教授",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "208",\n' +
                        '          "faculty": "测绘学院",\n' +
                        '          "courseName": "C/C++程序设计",\n' +
                        '          "teacherName": "温扬茂",\n' +
                        '          "teacherTitle": "教授",\n' +
                        '          "courseTime": "第 2-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        }\n' +
                        '      ]\n' +
                        '    }\n' +
                        '  ],\n' +
                        '  [\n' +
                        '    {\n' +
                        '      "building": "06603",\n' +
                        '      "infos": [\n' +
                        '        {\n' +
                        '          "room": "06603",\n' +
                        '          "faculty": "泰康医学院(基础医学院)",\n' +
                        '          "courseName": "神经科学",\n' +
                        '          "teacherName": "何柳",\n' +
                        '          "teacherTitle": "讲师",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        }\n' +
                        '      ]\n' +
                        '    },\n' +
                        '    {\n' +
                        '      "building": "402221",\n' +
                        '      "infos": [\n' +
                        '        {\n' +
                        '          "room": "402221",\n' +
                        '          "faculty": "护理学院",\n' +
                        '          "courseName": "护理计划与实施Ⅱ",\n' +
                        '          "teacherName": "罗丹",\n' +
                        '          "teacherTitle": "副教授",\n' +
                        '          "courseTime": "第 1-3 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        }\n' +
                        '      ]\n' +
                        '    },\n' +
                        '    {\n' +
                        '      "building": "408003",\n' +
                        '      "infos": [\n' +
                        '        {\n' +
                        '          "room": "408003",\n' +
                        '          "faculty": "护理学院",\n' +
                        '          "courseName": "护理研究",\n' +
                        '          "teacherName": "喻惠丹",\n' +
                        '          "teacherTitle": "讲师",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        }\n' +
                        '      ]\n' +
                        '    },\n' +
                        '    {\n' +
                        '      "building": "8-教学楼",\n' +
                        '      "infos": [\n' +
                        '        {\n' +
                        '          "room": "210",\n' +
                        '          "faculty": "公共卫生学院",\n' +
                        '          "courseName": "医学统计学",\n' +
                        '          "teacherName": "马露",\n' +
                        '          "teacherTitle": "副教授",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "305",\n' +
                        '          "faculty": "大学英语部",\n' +
                        '          "courseName": "大学交际英语3",\n' +
                        '          "teacherName": "待定",\n' +
                        '          "teacherTitle": "",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "英语"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "306",\n' +
                        '          "faculty": "大学英语部",\n' +
                        '          "courseName": "大学交际英语3",\n' +
                        '          "teacherName": "待定",\n' +
                        '          "teacherTitle": "",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "英语"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "402",\n' +
                        '          "faculty": "药学院",\n' +
                        '          "courseName": "制药工程基础",\n' +
                        '          "teacherName": "台万一",\n' +
                        '          "teacherTitle": "教授",\n' +
                        '          "courseTime": "第 3-4 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "506",\n' +
                        '          "faculty": "通识教育中心",\n' +
                        '          "courseName": "人文社科经典导引",\n' +
                        '          "teacherName": "待定",\n' +
                        '          "teacherTitle": "",\n' +
                        '          "courseTime": "第 3-4 节",\n' +
                        '          "courseType": "通识选修课"\n' +
                        '        },\n' +
                        '        {\n' +
                        '          "room": "507",\n' +
                        '          "faculty": "第一临床学院",\n' +
                        '          "courseName": "妇产科学",\n' +
                        '          "teacherName": "洪莉",\n' +
                        '          "teacherTitle": "主任医师",\n' +
                        '          "courseTime": "第 3-4 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        }\n' +
                        '      ]\n' +
                        '    },\n' +
                        '    {\n' +
                        '      "building": "01102",\n' +
                        '      "infos": [\n' +
                        '        {\n' +
                        '          "room": "01102",\n' +
                        '          "faculty": "公共政治教学",\n' +
                        '          "courseName": "思想道德与法治",\n' +
                        '          "teacherName": "周志刚",\n' +
                        '          "teacherTitle": "副教授",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        }\n' +
                        '      ]\n' +
                        '    },\n' +
                        '    {\n' +
                        '      "building": "02201",\n' +
                        '      "infos": [\n' +
                        '        {\n' +
                        '          "room": "02201",\n' +
                        '          "faculty": "通识教育中心",\n' +
                        '          "courseName": "自然科学经典导引",\n' +
                        '          "teacherName": "待定",\n' +
                        '          "teacherTitle": "",\n' +
                        '          "courseTime": "第 3-4 节",\n' +
                        '          "courseType": "通识选修课"\n' +
                        '        }\n' +
                        '      ]\n' +
                        '    },\n' +
                        '    {\n' +
                        '      "building": "03301",\n' +
                        '      "infos": [\n' +
                        '        {\n' +
                        '          "room": "03301",\n' +
                        '          "faculty": "第一临床学院",\n' +
                        '          "courseName": "临床外科学",\n' +
                        '          "teacherName": "刘修恒",\n' +
                        '          "teacherTitle": "主任医师",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        }\n' +
                        '      ]\n' +
                        '    },\n' +
                        '    {\n' +
                        '      "building": "02241",\n' +
                        '      "infos": [\n' +
                        '        {\n' +
                        '          "room": "02241",\n' +
                        '          "faculty": "国际教育学院",\n' +
                        '          "courseName": "基础汉语3",\n' +
                        '          "teacherName": "李沛",\n' +
                        '          "teacherTitle": "讲师",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        }\n' +
                        '      ]\n' +
                        '    },\n' +
                        '    {\n' +
                        '      "building": "02251",\n' +
                        '      "infos": [\n' +
                        '        {\n' +
                        '          "room": "02251",\n' +
                        '          "faculty": "国际教育学院",\n' +
                        '          "courseName": "基础汉语1",\n' +
                        '          "teacherName": "周西宁",\n' +
                        '          "teacherTitle": "讲师",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        }\n' +
                        '      ]\n' +
                        '    },\n' +
                        '    {\n' +
                        '      "building": "408002",\n' +
                        '      "infos": [\n' +
                        '        {\n' +
                        '          "room": "408002",\n' +
                        '          "faculty": "泰康医学院(基础医学院)",\n' +
                        '          "courseName": "神经科学",\n' +
                        '          "teacherName": "唐燕",\n' +
                        '          "teacherTitle": "讲师",\n' +
                        '          "courseTime": "第 3-5 节",\n' +
                        '          "courseType": "专业教育课程"\n' +
                        '        }\n' +
                        '      ]\n' +
                        '    }\n' +
                        '  ],\n' +
                        '  []\n' +
                        ']')
                };

                response.data.forEach((division: BuildingInfo[], index: number) => {
                    if (index in this.courseData) {
                        this.courseData[index] = division;
                    }
                });

                // 构建教学楼和课程信息的映射
                Object.values(this.courseData).forEach((division) => {
                    division.forEach((building) => {
                        this.buildingCourseMap.set(building.building, building.infos);
                    });
                });

                console.log(this.courseData);
            } catch (error) {
                this.error = '获取课程信息失败';
            } finally {
                this.isLoading = false;
            }
        },
        getCoursesByDivisionAndBuilding(divisionIndex: number, buildingName: string): CourseInfo[] {
            // 直接从 Map 中获取课程信息
            return this.buildingCourseMap.get(buildingName) || [];
        },
        getBuildingsByDivision(divisionIndex: number): BuildingInfo[] {
            return this.courseData[divisionIndex] || [];
        },
        // 设置当前学部信息的 setter 方法
        setCurrentDivision(divisionIndex: string) {
            this._currentDivision = Number(divisionIndex);
        }
    }
});