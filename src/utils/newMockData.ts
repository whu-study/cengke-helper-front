/**
 * 基于新API设计的Mock数据生成器
 * 这个文件展示了如何使用新的数据结构来解决楼层分类问题
 */

import type {
    DivisionInfo,
    TimeSlot
} from '../types/courseNew';

/**
 * 生成符合新结构的Mock数据
 */
export function generateNewMockData(): DivisionInfo[] {
    const divisions: DivisionInfo[] = [
        // 文理学部
        {
            divisionId: 'liberal_arts',
            divisionName: '文理学部',
            description: '文理基础学科教学区域',
            icon: '/src/assets/helper/1.svg',
            totalBuildings: 2,
            totalFloors: 6,
            totalCourses: 25,
            buildings: [
                {
                    buildingId: 'building_a',
                    buildingName: '文理学部教学楼A',
                    buildingCode: 'A',
                    address: '武汉大学文理学部A区',
                    description: '主要用于数理化等基础学科教学',
                    totalFloors: 3,
                    totalRooms: 12,
                    totalCourses: 15,
                    floors: [
                        {
                            floorId: 'A_1',
                            floorName: 'A楼1层',
                            floorNumber: 1,
                            description: '大型阶梯教室区域',
                            rooms: [
                                {
                                    roomId: 'A101',
                                    roomNumber: 'A101',
                                    roomName: '多媒体教室1',
                                    capacity: 120,
                                    roomType: '多媒体教室',
                                    facilities: ['投影仪', '音响系统', '空调', '网络']
                                },
                                {
                                    roomId: 'A102',
                                    roomNumber: 'A102',
                                    roomName: '阶梯教室1',
                                    capacity: 200,
                                    roomType: '阶梯教室',
                                    facilities: ['投影仪', '扩音器', '空调']
                                },
                                {
                                    roomId: 'A103',
                                    roomNumber: 'A103',
                                    roomName: '多媒体教室2',
                                    capacity: 100,
                                    roomType: '多媒体教室',
                                    facilities: ['智能黑板', '音响系统', '空调']
                                },
                                {
                                    roomId: 'A104',
                                    roomNumber: 'A104',
                                    roomName: '阶梯教室2',
                                    capacity: 150,
                                    roomType: '阶梯教室',
                                    facilities: ['投影仪', '扩音器']
                                }
                            ],
                            courses: [
                                {
                                    id: 1,
                                    courseName: '高等数学A(1)',
                                    courseCode: 'MATH101',
                                    teacherName: '张教授',
                                    teacherTitle: '教授',
                                    faculty: '数学与统计学院',
                                    credits: 4,
                                    courseType: '必修课',
                                    room: 'A101',
                                    timeSlots: [
                                        { dayOfWeek: 1, startPeriod: 1, endPeriod: 2, weeks: '1-16周' },
                                        { dayOfWeek: 3, startPeriod: 3, endPeriod: 4, weeks: '1-16周' }
                                    ],
                                    capacity: 120,
                                    enrolled: 85,
                                    description: '微积分基础理论与应用',
                                    prerequisites: ['中学数学'],
                                    averageRating: 4.2,
                                    reviewCount: 23
                                },
                                {
                                    id: 2,
                                    courseName: '大学物理A(1)',
                                    courseCode: 'PHYS101',
                                    teacherName: '李教授',
                                    teacherTitle: '副教授',
                                    faculty: '物理科学与技术学院',
                                    credits: 4,
                                    courseType: '必修课',
                                    room: 'A102',
                                    timeSlots: [
                                        { dayOfWeek: 2, startPeriod: 1, endPeriod: 2, weeks: '1-16周' },
                                        { dayOfWeek: 4, startPeriod: 1, endPeriod: 2, weeks: '1-16周' }
                                    ],
                                    capacity: 200,
                                    enrolled: 180,
                                    averageRating: 4.0,
                                    reviewCount: 45
                                },
                                {
                                    id: 3,
                                    courseName: '无机化学',
                                    courseCode: 'CHEM101',
                                    teacherName: '王教授',
                                    teacherTitle: '教授',
                                    faculty: '化学与分子科学学院',
                                    credits: 3,
                                    courseType: '专业课',
                                    room: 'A103',
                                    timeSlots: [
                                        { dayOfWeek: 1, startPeriod: 5, endPeriod: 6, weeks: '1-16周' }
                                    ],
                                    capacity: 100,
                                    enrolled: 75,
                                    averageRating: 4.1,
                                    reviewCount: 18
                                }
                            ]
                        },
                        {
                            floorId: 'A_2',
                            floorName: 'A楼2层',
                            floorNumber: 2,
                            description: '中型教室和研讨室',
                            rooms: [
                                {
                                    roomId: 'A201',
                                    roomNumber: 'A201',
                                    roomName: '研讨室1',
                                    capacity: 40,
                                    roomType: '研讨室',
                                    facilities: ['智能黑板', '圆桌', '空调', '网络']
                                },
                                {
                                    roomId: 'A202',
                                    roomNumber: 'A202',
                                    roomName: '多媒体教室3',
                                    capacity: 60,
                                    roomType: '多媒体教室',
                                    facilities: ['投影仪', '音响', '空调']
                                },
                                {
                                    roomId: 'A203',
                                    roomNumber: 'A203',
                                    roomName: '研讨室2',
                                    capacity: 35,
                                    roomType: '研讨室',
                                    facilities: ['智能黑板', '讨论桌', '网络']
                                },
                                {
                                    roomId: 'A204',
                                    roomNumber: 'A204',
                                    roomName: '普通教室1',
                                    capacity: 50,
                                    roomType: '普通教室',
                                    facilities: ['黑板', '空调']
                                }
                            ],
                            courses: [
                                {
                                    id: 4,
                                    courseName: '线性代数',
                                    courseCode: 'MATH102',
                                    teacherName: '陈教授',
                                    teacherTitle: '副教授',
                                    faculty: '数学与统计学院',
                                    credits: 3,
                                    courseType: '必修课',
                                    room: 'A201',
                                    timeSlots: [
                                        { dayOfWeek: 2, startPeriod: 3, endPeriod: 4, weeks: '1-16周' }
                                    ],
                                    capacity: 40,
                                    enrolled: 32,
                                    averageRating: 4.5,
                                    reviewCount: 12
                                },
                                {
                                    id: 5,
                                    courseName: '概率论与数理统计',
                                    courseCode: 'MATH201',
                                    teacherName: '刘教授',
                                    teacherTitle: '教授',
                                    faculty: '数学与统计学院',
                                    credits: 3,
                                    courseType: '专业课',
                                    room: 'A202',
                                    timeSlots: [
                                        { dayOfWeek: 3, startPeriod: 1, endPeriod: 2, weeks: '1-16周' }
                                    ],
                                    capacity: 60,
                                    enrolled: 45,
                                    averageRating: 4.3,
                                    reviewCount: 20
                                }
                            ]
                        },
                        {
                            floorId: 'A_3',
                            floorName: 'A楼3层',
                            floorNumber: 3,
                            description: '实验室和专业教室',
                            rooms: [
                                {
                                    roomId: 'A301',
                                    roomNumber: 'A301',
                                    roomName: '物理实验室1',
                                    capacity: 30,
                                    roomType: '实验室',
                                    facilities: ['实验台', '仪器设备', '通风系统', '网络']
                                },
                                {
                                    roomId: 'A302',
                                    roomNumber: 'A302',
                                    roomName: '化学实验室1',
                                    capacity: 25,
                                    roomType: '实验室',
                                    facilities: ['实验台', '通风橱', '安全设备', '网络']
                                },
                                {
                                    roomId: 'A303',
                                    roomNumber: 'A303',
                                    roomName: '计算机教室1',
                                    capacity: 40,
                                    roomType: '计算机教室',
                                    facilities: ['电脑', '投影仪', '网络', '空调']
                                }
                            ],
                            courses: [
                                {
                                    id: 6,
                                    courseName: '大学物理实验',
                                    courseCode: 'PHYS201',
                                    teacherName: '赵教授',
                                    teacherTitle: '副教授',
                                    faculty: '物理科学与技术学院',
                                    credits: 2,
                                    courseType: '必修课',
                                    room: 'A301',
                                    timeSlots: [
                                        { dayOfWeek: 4, startPeriod: 5, endPeriod: 8, weeks: '1-16周' }
                                    ],
                                    capacity: 30,
                                    enrolled: 28,
                                    averageRating: 4.0,
                                    reviewCount: 15
                                },
                                {
                                    id: 7,
                                    courseName: '无机化学实验',
                                    courseCode: 'CHEM201',
                                    teacherName: '孙教授',
                                    teacherTitle: '教授',
                                    faculty: '化学与分子科学学院',
                                    credits: 2,
                                    courseType: '专业课',
                                    room: 'A302',
                                    timeSlots: [
                                        { dayOfWeek: 5, startPeriod: 5, endPeriod: 8, weeks: '1-16周' }
                                    ],
                                    capacity: 25,
                                    enrolled: 22,
                                    averageRating: 4.2,
                                    reviewCount: 10
                                }
                            ]
                        }
                    ]
                },
                {
                    buildingId: 'building_b',
                    buildingName: '文理学部教学楼B',
                    buildingCode: 'B',
                    address: '武汉大学文理学部B区',
                    description: '主要用于文史哲等人文学科教学',
                    totalFloors: 3,
                    totalRooms: 10,
                    totalCourses: 10,
                    floors: [
                        {
                            floorId: 'B_1',
                            floorName: 'B楼1层',
                            floorNumber: 1,
                            description: '人文学科教室',
                            rooms: [
                                {
                                    roomId: 'B101',
                                    roomNumber: 'B101',
                                    roomName: '文史教室1',
                                    capacity: 60,
                                    roomType: '普通教室',
                                    facilities: ['黑板', '投影仪', '空调']
                                },
                                {
                                    roomId: 'B102',
                                    roomNumber: 'B102',
                                    roomName: '语音教室',
                                    capacity: 40,
                                    roomType: '语音教室',
                                    facilities: ['语音设备', '耳机', '投影仪', '空调']
                                }
                            ],
                            courses: [
                                {
                                    id: 8,
                                    courseName: '中国古代文学',
                                    courseCode: 'CHIN201',
                                    teacherName: '周教授',
                                    teacherTitle: '教授',
                                    faculty: '文学院',
                                    credits: 3,
                                    courseType: '专业课',
                                    room: 'B101',
                                    timeSlots: [
                                        { dayOfWeek: 1, startPeriod: 3, endPeriod: 4, weeks: '1-16周' }
                                    ],
                                    capacity: 60,
                                    enrolled: 45,
                                    averageRating: 4.6,
                                    reviewCount: 25
                                },
                                {
                                    id: 9,
                                    courseName: '英语精读',
                                    courseCode: 'ENG101',
                                    teacherName: '吴教授',
                                    teacherTitle: '副教授',
                                    faculty: '外国语言文学学院',
                                    credits: 3,
                                    courseType: '通识课',
                                    room: 'B102',
                                    timeSlots: [
                                        { dayOfWeek: 2, startPeriod: 1, endPeriod: 2, weeks: '1-16周' }
                                    ],
                                    capacity: 40,
                                    enrolled: 38,
                                    averageRating: 4.4,
                                    reviewCount: 30
                                }
                            ]
                        }
                        // 可以继续添加B楼2层、3层...
                    ]
                }
            ]
        },

        // 工学部
        {
            divisionId: 'engineering',
            divisionName: '工学部',
            description: '工程技术学科教学区域',
            icon: '/src/assets/helper/2.svg',
            totalBuildings: 2,
            totalFloors: 8,
            totalCourses: 30,
            buildings: [
                {
                    buildingId: 'building_c',
                    buildingName: '工学部主楼',
                    buildingCode: 'C',
                    totalFloors: 4,
                    totalRooms: 20,
                    totalCourses: 20,
                    floors: [
                        {
                            floorId: 'C_1',
                            floorName: 'C楼1层',
                            floorNumber: 1,
                            rooms: [
                                {
                                    roomId: 'C101',
                                    roomNumber: 'C101',
                                    roomName: '工程制图教室',
                                    capacity: 50,
                                    roomType: '专业教室',
                                    facilities: ['制图桌', '投影仪', '空调']
                                }
                            ],
                            courses: [
                                {
                                    id: 10,
                                    courseName: '工程制图',
                                    courseCode: 'ENG101',
                                    teacherName: '郑教授',
                                    teacherTitle: '副教授',
                                    faculty: '机械与动力工程学院',
                                    credits: 3,
                                    courseType: '专业课',
                                    room: 'C101',
                                    timeSlots: [
                                        { dayOfWeek: 1, startPeriod: 1, endPeriod: 3, weeks: '1-16周' }
                                    ],
                                    capacity: 50,
                                    enrolled: 42,
                                    averageRating: 4.1,
                                    reviewCount: 18
                                }
                            ]
                        }
                        // 继续添加其他楼层...
                    ]
                }
            ]
        },

        // 信息学部
        {
            divisionId: 'information',
            divisionName: '信息学部',
            description: '计算机与信息技术学科教学区域',
            icon: '/src/assets/helper/3.svg',
            totalBuildings: 2,
            totalFloors: 10,
            totalCourses: 35,
            buildings: [
                {
                    buildingId: 'building_e',
                    buildingName: '信息学部计算机楼',
                    buildingCode: 'E',
                    totalFloors: 5,
                    totalRooms: 25,
                    totalCourses: 25,
                    floors: [
                        {
                            floorId: 'E_1',
                            floorName: 'E楼1层',
                            floorNumber: 1,
                            rooms: [
                                {
                                    roomId: 'E101',
                                    roomNumber: 'E101',
                                    roomName: '计算机基础教室1',
                                    capacity: 60,
                                    roomType: '计算机教室',
                                    facilities: ['高配置电脑', '双屏显示器', '网络', '空调']
                                }
                            ],
                            courses: [
                                {
                                    id: 11,
                                    courseName: '程序设计基础',
                                    courseCode: 'CS101',
                                    teacherName: '黄教授',
                                    teacherTitle: '教授',
                                    faculty: '计算机学院',
                                    credits: 4,
                                    courseType: '专业课',
                                    room: 'E101',
                                    timeSlots: [
                                        { dayOfWeek: 1, startPeriod: 1, endPeriod: 2, weeks: '1-16周' },
                                        { dayOfWeek: 3, startPeriod: 3, endPeriod: 4, weeks: '1-16周' }
                                    ],
                                    capacity: 60,
                                    enrolled: 55,
                                    averageRating: 4.3,
                                    reviewCount: 40
                                }
                            ]
                        }
                    ]
                }
            ]
        },

        // 医学部
        {
            divisionId: 'medical',
            divisionName: '医学部',
            description: '医学学科教学区域',
            icon: '/src/assets/helper/4.svg',
            totalBuildings: 2,
            totalFloors: 6,
            totalCourses: 20,
            buildings: [
                {
                    buildingId: 'building_g',
                    buildingName: '医学部教学楼',
                    buildingCode: 'G',
                    totalFloors: 3,
                    totalRooms: 15,
                    totalCourses: 15,
                    floors: [
                        {
                            floorId: 'G_1',
                            floorName: 'G楼1层',
                            floorNumber: 1,
                            rooms: [
                                {
                                    roomId: 'G101',
                                    roomNumber: 'G101',
                                    roomName: '解剖学教室',
                                    capacity: 40,
                                    roomType: '专业教室',
                                    facilities: ['解剖台', '标本柜', '投影仪', '通风系统']
                                }
                            ],
                            courses: [
                                {
                                    id: 12,
                                    courseName: '人体解剖学',
                                    courseCode: 'MED101',
                                    teacherName: '马教授',
                                    teacherTitle: '教授',
                                    faculty: '基础医学院',
                                    credits: 4,
                                    courseType: '专业课',
                                    room: 'G101',
                                    timeSlots: [
                                        { dayOfWeek: 1, startPeriod: 1, endPeriod: 3, weeks: '1-16周' },
                                        { dayOfWeek: 3, startPeriod: 1, endPeriod: 3, weeks: '1-16周' }
                                    ],
                                    capacity: 40,
                                    enrolled: 35,
                                    averageRating: 4.5,
                                    reviewCount: 28
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ];

    return divisions;
}

/**
 * 将新的数据结构转换为旧的数据结构格式
 * 用于在不修改现有组件的情况下快速适配
 */
export function convertNewDataToOldFormat(newData: DivisionInfo[]): any[][] {
    return newData.map(division =>
        division.buildings.map((building, index) => ({
            building: building.buildingName,
            label: building.buildingName,
            value: index,
            infos: building.floors.flatMap(floor =>
                floor.courses.map(course => ({
                    id: course.id,
                    room: course.room,
                    faculty: course.faculty,
                    courseName: course.courseName,
                    teacherName: course.teacherName,
                    teacherTitle: course.teacherTitle,
                    courseTime: formatTimeSlots(course.timeSlots),
                    courseType: course.courseType
                }))
            )
        }))
    );
}/**
 * 格式化时间段显示
 */
function formatTimeSlots(timeSlots: TimeSlot[]): string {
    if (!timeSlots || timeSlots.length === 0) return '';

    const dayNames = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];

    return timeSlots.map(slot =>
        `${dayNames[slot.dayOfWeek]} ${slot.startPeriod}-${slot.endPeriod}节`
    ).join(' ');
}

/**
 * 为前端组件提供楼层数据的适配器
 */
export class FloorDataAdapter {
    private newData: DivisionInfo[];

    constructor(data: DivisionInfo[]) {
        this.newData = data;
    }

    /**
     * 获取指定学部的教学楼列表
     */
    getBuildingsByDivision(divisionIndex: number) {
        const division = this.newData[divisionIndex];
        if (!division) return [];

        return division.buildings.map((building, index) => ({
            building: building.buildingName,
            label: building.buildingName,
            value: index,
            floors: building.floors,
            totalCourses: building.totalCourses,
            infos: building.floors.flatMap(floor => floor.courses)
        }));
    }

    /**
     * 获取楼层的详细信息（包含正确的楼层分组）
     */
    getBuildingFloors(divisionIndex: number, buildingIndex: number) {
        const buildings = this.getBuildingsByDivision(divisionIndex);
        const building = buildings[buildingIndex];

        if (!building) return [];

        return building.floors.map(floor => ({
            floorName: floor.floorName,
            floorNumber: floor.floorNumber,
            rooms: floor.rooms,
            courses: floor.courses
        }));
    }

    /**
     * 获取楼层的课程列表
     */
    getFloorCourses(divisionIndex: number, buildingIndex: number, floorIndex: number) {
        const floors = this.getBuildingFloors(divisionIndex, buildingIndex);
        const floor = floors[floorIndex];

        return floor ? floor.courses : [];
    }
}

export default {
    generateNewMockData,
    convertNewDataToOldFormat,
    FloorDataAdapter
};