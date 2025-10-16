# 课程助手API接口设计文档

## 概述

基于四级导航结构（学部 → 教学楼 → 楼层 → 课程）重新设计的API接口，提供更清晰的数据层次和更好的用户体验。

## 1. 获取课程数据接口

### 接口地址
```
GET /api/courses
```

### 响应格式
```json
{
  "code": 0,
  "msg": "success",
  "data": [
    {
      "divisionId": "liberal_arts",
      "divisionName": "文理学部",
      "description": "文理基础学科教学区域",
      "totalBuildings": 2,
      "totalFloors": 6,
      "totalCourses": 25,
      "buildings": [
        {
          "buildingId": "building_a",
          "buildingName": "文理学部教学楼A",
          "buildingCode": "A",
          "address": "武汉大学文理学部A区",
          "description": "主要用于数理化等基础学科教学",
          "totalFloors": 3,
          "totalRooms": 30,
          "totalCourses": 15,
          "floors": [
            {
              "floorId": "A_1",
              "floorName": "A楼1层",
              "floorNumber": 1,
              "description": "主要为大型阶梯教室",
              "rooms": [
                {
                  "roomId": "A101",
                  "roomNumber": "A101",
                  "roomName": "多媒体教室1",
                  "capacity": 120,
                  "roomType": "多媒体教室",
                  "facilities": ["投影仪", "音响系统", "空调", "网络"]
                },
                {
                  "roomId": "A102",
                  "roomNumber": "A102",
                  "roomName": "阶梯教室",
                  "capacity": 200,
                  "roomType": "阶梯教室",
                  "facilities": ["投影仪", "扩音器", "空调"]
                }
              ],
              "courses": [
                {
                  "id": 1,
                  "courseName": "高等数学A(1)",
                  "courseCode": "MATH101",
                  "teacherName": "张教授",
                  "teacherTitle": "教授",
                  "faculty": "数学与统计学院",
                  "credits": 4,
                  "courseType": "必修课",
                  "room": "A101",
                  "timeSlots": [
                    {
                      "dayOfWeek": 1,
                      "startPeriod": 1,
                      "endPeriod": 2,
                      "weeks": "1-16周"
                    },
                    {
                      "dayOfWeek": 3,
                      "startPeriod": 3,
                      "endPeriod": 4,
                      "weeks": "1-16周"
                    }
                  ],
                  "capacity": 120,
                  "enrolled": 85,
                  "description": "微积分基础理论与应用",
                  "prerequisites": ["中学数学"],
                  "averageRating": 4.2,
                  "reviewCount": 23
                }
              ]
            },
            {
              "floorId": "A_2",
              "floorName": "A楼2层",
              "floorNumber": 2,
              "description": "中型教室和研讨室",
              "rooms": [
                {
                  "roomId": "A201",
                  "roomNumber": "A201",
                  "roomName": "研讨室1",
                  "capacity": 40,
                  "roomType": "研讨室",
                  "facilities": ["智能黑板", "圆桌", "空调", "网络"]
                }
              ],
              "courses": [
                {
                  "id": 2,
                  "courseName": "线性代数",
                  "courseCode": "MATH102",
                  "teacherName": "李教授",
                  "teacherTitle": "副教授",
                  "faculty": "数学与统计学院",
                  "credits": 3,
                  "courseType": "必修课",
                  "room": "A201",
                  "timeSlots": [
                    {
                      "dayOfWeek": 2,
                      "startPeriod": 1,
                      "endPeriod": 2,
                      "weeks": "1-16周"
                    }
                  ],
                  "capacity": 40,
                  "enrolled": 32,
                  "averageRating": 4.5,
                  "reviewCount": 12
                }
              ]
            },
            {
              "floorId": "A_3",
              "floorName": "A楼3层",
              "floorNumber": 3,
              "description": "专业实验室和小教室",
              "rooms": [
                {
                  "roomId": "A301",
                  "roomNumber": "A301",
                  "roomName": "物理实验室",
                  "capacity": 30,
                  "roomType": "实验室",
                  "facilities": ["实验台", "仪器设备", "通风系统", "网络"]
                }
              ],
              "courses": [
                {
                  "id": 3,
                  "courseName": "大学物理实验",
                  "courseCode": "PHYS201",
                  "teacherName": "王教授",
                  "teacherTitle": "教授",
                  "faculty": "物理科学与技术学院",
                  "credits": 2,
                  "courseType": "必修课",
                  "room": "A301",
                  "timeSlots": [
                    {
                      "dayOfWeek": 4,
                      "startPeriod": 5,
                      "endPeriod": 8,
                      "weeks": "1-16周"
                    }
                  ],
                  "capacity": 30,
                  "enrolled": 28,
                  "averageRating": 4.0,
                  "reviewCount": 15
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

## 2. 课程筛选接口

### 接口地址
```
GET /api/courses/search
```

### 请求参数
```typescript
interface CourseSearchParams {
  divisionId?: string;      // 学部ID筛选
  buildingId?: string;      // 教学楼ID筛选  
  floorId?: string;         // 楼层ID筛选
  faculty?: string;         // 学院筛选
  courseType?: string;      // 课程类型筛选
  dayOfWeek?: number;       // 星期筛选 (1-7)
  timeSlot?: string;        // 时间段筛选 "1-2" 表示1-2节
  teacherName?: string;     // 教师姓名筛选
  keyword?: string;         // 关键词搜索（课程名、教师名等）
  page?: number;           // 分页页码
  pageSize?: number;       // 每页数量
}
```

### 示例请求
```
GET /api/courses/search?divisionId=liberal_arts&buildingId=building_a&floorId=A_1&page=1&pageSize=10
```

### 响应格式
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "courses": [
      {
        "id": 1,
        "courseName": "高等数学A(1)",
        "courseCode": "MATH101",
        // ... 其他课程信息
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 25,
      "totalPages": 3
    },
    "filters": {
      "appliedFilters": {
        "divisionId": "liberal_arts",
        "buildingId": "building_a",
        "floorId": "A_1"
      }
    }
  }
}
```

## 3. 获取课程详情接口

### 接口地址
```
GET /api/courses/{courseId}/detail
```

### 响应格式
```json
{
  "code": 0,
  "msg": "success", 
  "data": {
    "id": 1,
    "courseName": "高等数学A(1)",
    "courseCode": "MATH101",
    // ... 基础课程信息
    "syllabus": "本课程涵盖微积分基础理论...",
    "textbooks": [
      {
        "title": "高等数学（第七版）上册",
        "author": "同济大学数学系",
        "publisher": "高等教育出版社",
        "isbn": "9787040396638",
        "isRequired": true
      }
    ],
    "schedule": [
      {
        "week": 1,
        "date": "2024-09-02",
        "topic": "函数与极限",
        "room": "A101",
        "timeSlot": {
          "dayOfWeek": 1,
          "startPeriod": 1,
          "endPeriod": 2,
          "weeks": "1-16周"
        }
      }
    ],
    "exams": [
      {
        "examType": "期中考试",
        "date": "2024-11-15",
        "time": "14:30-16:30",
        "room": "A101",
        "duration": 120,
        "description": "闭卷考试，可携带计算器"
      }
    ]
  }
}
```

## 4. 数据库设计建议

### 主要表结构

1. **divisions（学部表）**
```sql
CREATE TABLE divisions (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_url VARCHAR(255),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

2. **buildings（教学楼表）**
```sql
CREATE TABLE buildings (
  id VARCHAR(50) PRIMARY KEY,
  division_id VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(10) NOT NULL,
  address TEXT,
  description TEXT,
  total_floors INT DEFAULT 0,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (division_id) REFERENCES divisions(id)
);
```

3. **floors（楼层表）**
```sql
CREATE TABLE floors (
  id VARCHAR(50) PRIMARY KEY,
  building_id VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  floor_number INT NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (building_id) REFERENCES buildings(id)
);
```

4. **rooms（教室表）**
```sql
CREATE TABLE rooms (
  id VARCHAR(50) PRIMARY KEY,
  floor_id VARCHAR(50) NOT NULL,
  room_number VARCHAR(20) NOT NULL,
  room_name VARCHAR(100),
  capacity INT,
  room_type VARCHAR(50),
  facilities JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (floor_id) REFERENCES floors(id)
);
```

5. **courses（课程表）**
```sql
CREATE TABLE courses (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  course_code VARCHAR(20) NOT NULL,
  course_name VARCHAR(200) NOT NULL,
  teacher_name VARCHAR(100) NOT NULL,
  teacher_title VARCHAR(50),
  faculty VARCHAR(100) NOT NULL,
  credits DECIMAL(3,1) NOT NULL,
  course_type VARCHAR(50) NOT NULL,
  room_id VARCHAR(50) NOT NULL,
  capacity INT,
  enrolled INT DEFAULT 0,
  description TEXT,
  syllabus TEXT,
  prerequisites JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id)
);
```

6. **course_time_slots（课程时间表）**
```sql
CREATE TABLE course_time_slots (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  course_id BIGINT NOT NULL,
  day_of_week INT NOT NULL,
  start_period INT NOT NULL,
  end_period INT NOT NULL,
  weeks VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id)
);
```

## 5. 后端实现要点

### 5.1 数据聚合
```python
# 示例：Python Flask实现
@app.route('/api/courses', methods=['GET'])
def get_courses():
    try:
        # 查询所有学部
        divisions = Division.query.order_by(Division.sort_order).all()
        
        result = []
        for division in divisions:
            # 查询该学部下的所有教学楼
            buildings = Building.query.filter_by(division_id=division.id)\
                                    .order_by(Building.sort_order).all()
            
            division_data = {
                'divisionId': division.id,
                'divisionName': division.name,
                'description': division.description,
                'icon': division.icon_url,
                'buildings': []
            }
            
            for building in buildings:
                # 查询楼层
                floors = Floor.query.filter_by(building_id=building.id)\
                               .order_by(Floor.floor_number).all()
                
                building_data = {
                    'buildingId': building.id,
                    'buildingName': building.name,
                    'buildingCode': building.code,
                    'floors': []
                }
                
                for floor in floors:
                    # 查询教室和课程
                    rooms = Room.query.filter_by(floor_id=floor.id).all()
                    courses = db.session.query(Course).join(Room)\
                                .filter(Room.floor_id == floor.id).all()
                    
                    floor_data = {
                        'floorId': floor.id,
                        'floorName': floor.name,
                        'floorNumber': floor.floor_number,
                        'rooms': [room.to_dict() for room in rooms],
                        'courses': [course.to_dict() for course in courses]
                    }
                    building_data['floors'].append(floor_data)
                
                division_data['buildings'].append(building_data)
            
            result.append(division_data)
        
        return jsonify({
            'code': 0,
            'msg': 'success',
            'data': result
        })
        
    except Exception as e:
        return jsonify({
            'code': -1,
            'msg': str(e),
            'data': None
        }), 500
```

### 5.2 性能优化建议

1. **缓存策略**
   - Redis缓存完整的课程数据结构
   - 设置合理的过期时间（如1小时）
   - 数据更新时清除相关缓存

2. **数据库优化**
   - 适当的索引设计
   - 使用连接查询减少查询次数
   - 考虑数据预聚合

3. **分页支持**
   - 课程列表支持分页
   - 前端可以按需加载数据

## 6. 前端适配要点

现有的前端代码需要做以下调整：

1. 更新类型定义，使用新的数据结构
2. 修改数据转换逻辑，直接使用API返回的楼层数据
3. 更新Store中的数据处理方法
4. 优化组件的数据绑定逻辑

这样的API设计具有以下优势：
- 🏗️ **结构清晰**：四级层次分明，易于理解和维护
- 🔍 **查询灵活**：支持多维度筛选和搜索
- 📊 **统计完整**：每个层级都包含统计信息
- 🚀 **性能优化**：支持缓存和分页
- 🔧 **易于扩展**：可以轻松添加新字段和功能