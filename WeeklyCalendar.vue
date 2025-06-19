<template>
  <div class="weekly-calendar scaled-to-fit">
    <div class="calendar-container scaled-to-fit">
      <div class="calendar-main">
        <div class="calendar-header">
          <div class="time-column"></div>
          <div 
            v-for="day in weekDays" 
            :key="day.value"
            class="day-header"
          >
            {{ day.label }}
          </div>
        </div>
        
        <div class="calendar-body">
          <div 
            v-for="timeSlot in timeSlots" 
            :key="timeSlot.hour"
            class="time-row"
          >
            <div class="time-label">{{ timeSlot.label }}</div>
            <div 
              v-for="day in weekDays" 
              :key="`${day.value}-${timeSlot.hour}`"
              class="time-cell"
              :class="getCellClass(day.value, timeSlot.hour)"
            >
              <div class="course-blocks-container">
                <!-- 多课程并排显示 -->
                <div 
                  v-for="(course, index) in getCourseForSlot(day.value, timeSlot.hour)"
                  :key="course.id"
                  class="course-block"
                  :class="getCourseBlockClass(course)"
                  :style="getMultiCourseStyle(index, getCourseForSlot(day.value, timeSlot.hour).length)"
                  @click="toggleCourseSelection(course)"
                >
                  <div class="course-name">{{ course.name }}</div>
                  <div class="course-info">{{ course.teacher }} · {{ course.room }}</div>
                  <div v-if="getCourseForSlot(day.value, timeSlot.hour).length > 1" class="course-index">
                    {{ index + 1 }}/{{ getCourseForSlot(day.value, timeSlot.hour).length }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="course-sidebar">
        <h3>可选课程</h3>
        <div class="course-list">
          <div 
            v-for="course in allCourses"
            :key="course.id"
            class="course-item"
            :class="getCourseItemClass(course)"
            @click="toggleCourseSelection(course)"
          >
            <div class="course-info">
              <div class="course-name">{{ course.name }}</div>
              <div class="course-details">
                <span class="course-teacher">{{ course.teacher }}</span>
                <span class="course-time">{{ formatCourseTime(course) }}</span>
                <span class="course-room">{{ course.room }}</span>
              </div>
            </div>
            <div class="course-status">
              <span v-if="course.selected" class="status-badge selected">已选</span>
              <span v-else-if="isConflicted(course)" class="status-badge conflicted" :title="`与${getConflictedCourse(course)?.name}冲突`">
                与{{ getConflictedCourse(course)?.name }}冲突
              </span>
              <span v-else class="status-badge available">可选</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 确认对话框 -->
    <div v-if="showConfirmDialog" class="dialog-overlay" @click="cancelReplacement">
      <div class="confirm-dialog" @click.stop>
        <div class="dialog-header">
          <h3>课程选择确认</h3>
        </div>
        <div class="dialog-content">
          <p>选择 <strong>{{ pendingCourse?.name }}</strong> 将会取消已选的 <strong>{{ conflictedCourse?.name }}</strong></p>
          <p>两门课程时间冲突：<span class="time-info">{{ formatCourseTime(pendingCourse) }}</span></p>
          <p>是否确认替换？</p>
        </div>
        <div class="dialog-actions">
          <button class="btn-cancel" @click="cancelReplacement">取消</button>
          <button class="btn-confirm" @click="confirmReplacement">确认替换</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const weekDays = [
  { value: 1, label: '周一' },
  { value: 2, label: '周二' },
  { value: 3, label: '周三' },
  { value: 4, label: '周四' },
  { value: 5, label: '周五' },
  { value: 6, label: '周六' },
  { value: 7, label: '周日' }
]

const timeSlots = [
  { hour: 8, label: '08:00' },
  { hour: 9, label: '09:00' },
  { hour: 10, label: '10:00' },
  { hour: 11, label: '11:00' },
  { hour: 12, label: '12:00' },
  { hour: 13, label: '13:00' },
  { hour: 14, label: '14:00' },
  { hour: 15, label: '15:00' },
  { hour: 16, label: '16:00' },
  { hour: 17, label: '17:00' },
  { hour: 18, label: '18:00' },
  { hour: 19, label: '19:00' }
]

const courses = ref([
  // 周一 8-10点 时间冲突课程
  {
    id: 1,
    name: "高等数学A班",
    teacher: "张教授",
    time: { day: 1, start: 8, end: 10 },
    room: "A101",
    selected: false,
    credits: 4
  },
  {
    id: 2,
    name: "高等数学B班",
    teacher: "李教授",
    time: { day: 1, start: 8, end: 10 },
    room: "A102",
    selected: false,
    credits: 4
  },
  
  // 周二 9-11点 时间冲突课程
  {
    id: 3,
    name: "线性代数",
    teacher: "王教授",
    time: { day: 2, start: 9, end: 11 },
    room: "B201",
    selected: false,
    credits: 3
  },
  {
    id: 4,
    name: "概率论",
    teacher: "刘教授",
    time: { day: 2, start: 9, end: 11 },
    room: "B202",
    selected: false,
    credits: 3
  },
  
  // 周三 14-16点 时间冲突课程
  {
    id: 5,
    name: "数据结构",
    teacher: "陈教授",
    time: { day: 3, start: 14, end: 16 },
    room: "C301",
    selected: false,
    credits: 4
  },
  {
    id: 6,
    name: "算法基础",
    teacher: "赵教授",
    time: { day: 3, start: 14, end: 16 },
    room: "C302",
    selected: false,
    credits: 3
  },
  
  // 周四 10-12点 时间冲突课程
  {
    id: 7,
    name: "计算机组成原理",
    teacher: "吴教授",
    time: { day: 4, start: 10, end: 12 },
    room: "D401",
    selected: false,
    credits: 4
  },
  {
    id: 8,
    name: "微机原理",
    teacher: "周教授",
    time: { day: 4, start: 10, end: 12 },
    room: "D402",
    selected: false,
    credits: 3
  },
  
  // 周五 15-17点 时间冲突课程  
  {
    id: 9,
    name: "数据库原理",
    teacher: "孙教授",
    time: { day: 5, start: 15, end: 17 },
    room: "E501",
    selected: false,
    credits: 3
  },
  {
    id: 10,
    name: "软件工程",
    teacher: "钱教授",
    time: { day: 5, start: 15, end: 17 },
    room: "E502",
    selected: false,
    credits: 3
  },
  
  // 无冲突课程
  {
    id: 11,
    name: "操作系统",
    teacher: "朱教授",
    time: { day: 1, start: 14, end: 16 },
    room: "F601",
    selected: false,
    credits: 4
  },
  {
    id: 12,
    name: "计算机网络",
    teacher: "胡教授",
    time: { day: 2, start: 14, end: 16 },
    room: "F602",
    selected: false,
    credits: 3
  },
  {
    id: 13,
    name: "编译原理",
    teacher: "郑教授",
    time: { day: 4, start: 15, end: 17 },
    room: "G701",
    selected: false,
    credits: 3
  }
])

const selectedCourses = computed(() => 
  courses.value.filter(course => course.selected)
)

const allCourses = computed(() => courses.value)

// 确认对话框状态管理
const showConfirmDialog = ref(false)
const pendingCourse = ref(null)
const conflictedCourse = ref(null)

// 移除缩放模式状态管理，固定为适应模式

// 检查时间冲突
const isTimeConflict = (course1, course2) => {
  if (course1.time.day !== course2.time.day) return false
  
  const start1 = course1.time.start
  const end1 = course1.time.end
  const start2 = course2.time.start
  const end2 = course2.time.end
  
  // 检查时间段是否重叠
  return !(end1 <= start2 || end2 <= start1)
}

// 检查课程是否与已选课程冲突
const isConflicted = (course) => {
  if (course.selected) return false
  
  return selectedCourses.value.some(selectedCourse => 
    selectedCourse.id !== course.id && isTimeConflict(course, selectedCourse)
  )
}

// 获取与指定课程冲突的已选课程
const getConflictedCourse = (course) => {
  if (course.selected) return null
  
  return selectedCourses.value.find(selectedCourse => 
    selectedCourse.id !== course.id && isTimeConflict(course, selectedCourse)
  )
}

const getCourseForSlot = (day, hour) => {
  return courses.value.filter(course => 
    course.time.day === day && 
    hour >= course.time.start && 
    hour < course.time.end
  )
}

const getCellClass = (day, hour) => {
  const coursesInSlot = getCourseForSlot(day, hour)
  if (coursesInSlot.length === 0) return ''
  
  const hasSelected = coursesInSlot.some(course => course.selected)
  const hasAvailable = coursesInSlot.some(course => course.available && !course.selected)
  
  return {
    'has-selected': hasSelected,
    'has-available': hasAvailable
  }
}

const getCourseBlockClass = (course) => {
  return {
    'selected': course.selected,
    'available': !course.selected && !isConflicted(course),
    'conflicted': !course.selected && isConflicted(course)
  }
}

const getCourseItemClass = (course) => {
  return {
    'selected': course.selected,
    'conflicted': isConflicted(course),
    'available': !course.selected && !isConflicted(course)
  }
}

const toggleCourseSelection = (course) => {
  if (course.selected) {
    // 取消选择已选课程
    course.selected = false
  } else if (isConflicted(course)) {
    // 处理冲突课程的选择
    const conflicted = getConflictedCourse(course)
    if (conflicted) {
      pendingCourse.value = course
      conflictedCourse.value = conflicted
      showConfirmDialog.value = true
    }
  } else {
    // 选择无冲突课程
    course.selected = true
  }
}

// 确认替代选择
const confirmReplacement = () => {
  if (pendingCourse.value && conflictedCourse.value) {
    conflictedCourse.value.selected = false
    pendingCourse.value.selected = true
  }
  closeConfirmDialog()
}

// 取消替代选择
const cancelReplacement = () => {
  closeConfirmDialog()
}

// 关闭确认对话框
const closeConfirmDialog = () => {
  showConfirmDialog.value = false
  pendingCourse.value = null
  conflictedCourse.value = null
}

// 移除切换模式逻辑

const formatCourseTime = (course) => {
  const dayName = weekDays.find(d => d.value === course.time.day)?.label
  return `${dayName} ${course.time.start}:00-${course.time.end}:00`
}

// 获取多课程并排显示的样式
const getMultiCourseStyle = (index, totalCount) => {
  if (totalCount === 1) {
    return {
      width: '100%',
      height: '100%'
    }
  }
  
  const width = Math.floor(100 / totalCount)
  const left = index * width
  
  return {
    position: 'absolute',
    left: `${left}%`,
    width: `${width - 1}%`, // 减去1%作为间隙
    height: '100%',
    top: '0'
  }
}

// 组件挂载时设置页面不可滚动（适应模式）
onMounted(() => {
  document.body.style.overflow = 'hidden'
})

// 组件卸载时恢复页面滚动
onUnmounted(() => {
  document.body.style.overflow = 'auto'
})
</script>

<style scoped>
.weekly-calendar {
  padding: 20px;
  font-family: Arial, sans-serif;
  height: calc(100vh - 40px);
  width: 100%;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

/* 移除切换按钮相关样式 */

.calendar-container {
  display: flex;
  gap: 20px;
  width: 100%;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  box-sizing: border-box;
}

/* 移除对整个容器的高度限制，保持背景完整 */

.calendar-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: calc(100% - 340px);
}

/* 课程表主体高度控制 */
.calendar-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: #e0e0e0;
  overflow: hidden;
  min-height: 0;
}

.time-row {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 80px repeat(7, 1fr);
  gap: 1px;
  width: 100%;
  min-width: 0;
}

.course-sidebar {
  width: 320px;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  flex: 0 0 320px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: 100%;
}

.calendar-header {
  display: grid;
  grid-template-columns: 80px repeat(7, 1fr);
  gap: 1px;
  background: #e0e0e0;
  flex-shrink: 0;
  width: 100%;
  min-width: 0;
}

.time-column {
  background: #f5f5f5;
}

.day-header {
  background: #f0f0f0;
  padding: 6px;
  text-align: center;
  font-weight: bold;
  font-size: 14px;
}


/* 移除固定最小高度设置，让时间行在适应模式下平分空间 */

.time-label {
  background: #f5f5f5;
  padding: 4px 2px;
  text-align: center;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.time-cell {
  background: white;
  padding: 1px;
  position: relative;
  cursor: pointer;
  overflow: visible;
  height: 100%;
  min-width: 0;
  width: 100%;
}

.course-blocks-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100%;
}

.time-cell.has-selected {
  background: #e3f2fd;
}

.time-cell.has-available {
  background: #f9f9f9;
}

.course-block {
  width: 100%;
  height: 100%;
  padding: 2px 4px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  border: 1px solid rgba(255,255,255,0.8);
  background: white;
  transition: all 0.3s ease;
  position: relative;
}

/* 课程状态样式 */
.course-block.selected {
  background: #2196f3 !important;
  color: white !important;
  box-shadow: 0 2px 4px rgba(33, 150, 243, 0.3) !important;
  border: 1px solid #2196f3 !important;
  transform: scale(1.02);
}

.course-block.available {
  background: rgba(76, 175, 80, 0.1) !important;
  color: #4caf50 !important;
  border: 1px dashed #4caf50 !important;
}

.course-block.conflicted {
  background: rgba(158, 158, 158, 0.2) !important;
  color: #757575 !important;
  opacity: 0.6 !important;
  cursor: not-allowed !important;
  border: 1px dashed #bdbdbd !important;
}

/* 移除重复的样式定义 */

.course-name {
  font-weight: bold;
  margin-bottom: 2px;
}

.course-teacher {
  font-size: 10px;
  opacity: 0.8;
}

.course-room {
  font-size: 10px;
  opacity: 0.7;
}

.course-info {
  font-size: 9px;
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.course-index {
  position: absolute;
  top: 2px;
  right: 2px;
  background: rgba(0,0,0,0.6);
  color: white;
  font-size: 8px;
  padding: 1px 4px;
  border-radius: 8px;
  font-weight: bold;
}

.course-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  background: rgba(0,0,0,0.6);
  color: white;
  font-size: 8px;
  padding: 1px 4px;
  border-radius: 8px;
  font-weight: bold;
}

.course-sidebar h3 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 18px;
}

.course-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  overflow-y: auto;
}

.course-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #e0e0e0;
  background: white;
}

.course-item:hover {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.course-item.selected {
  background: #e3f2fd;
  border-color: #2196f3;
  box-shadow: 0 2px 6px rgba(33, 150, 243, 0.2);
}

.course-item.conflicted {
  background: #f5f5f5;
  border-color: #bdbdbd;
  cursor: not-allowed;
  opacity: 0.7;
}

.course-item.available {
  border-color: #4caf50;
  background: rgba(76, 175, 80, 0.05);
}

.course-item.available:hover {
  background: rgba(76, 175, 80, 0.1);
  border-color: #388e3c;
}

.course-info {
  flex: 1;
}

.course-info .course-name {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 4px;
  color: #333;
}

.course-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 12px;
  color: #666;
}

.course-details span {
  display: block;
}

.course-status {
  margin-left: 12px;
}

.status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: bold;
  text-align: center;
  min-width: 40px;
}

.status-badge.selected {
  background: #2196f3;
  color: white;
}

.status-badge.available {
  background: #4caf50;
  color: white;
}

.status-badge.conflicted {
  background: #bdbdbd;
  color: #757575;
  max-width: 140px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 10px;
}

/* 确认对话框样式 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.confirm-dialog {
  background: white;
  border-radius: 8px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  animation: dialogFadeIn 0.2s ease-out;
}

@keyframes dialogFadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.dialog-header h3 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 18px;
}

.dialog-content {
  margin-bottom: 24px;
  line-height: 1.5;
}

.dialog-content p {
  margin: 8px 0;
  color: #555;
}

.dialog-content strong {
  color: #333;
  font-weight: 600;
}

.time-info {
  color: #666;
  font-size: 14px;
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.dialog-actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-cancel {
  background: #f5f5f5;
  color: #666;
}

.btn-cancel:hover {
  background: #e0e0e0;
}

.btn-confirm {
  background: #2196f3;
  color: white;
}

.btn-confirm:hover {
  background: #1976d2;
}
</style>