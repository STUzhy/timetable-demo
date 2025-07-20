<template>
  <div class="weekly-calendar scaled-to-fit">
    <div class="calendar-container scaled-to-fit">
      <div class="calendar-main" :style="{ width: `calc(100% - ${sidebarWidth}px - 8px)` }">
        <div class="calendar-header">
          <div class="time-column">Time</div>
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
              @click="handleCellClick(day.value, timeSlot.hour)"
            >
              <div class="course-blocks-container">
                <!-- 只在课程开始时间显示完整的课程块 -->
                <div 
                  v-for="(course, index) in getCourseStartsAtSlot(day.value, timeSlot.hour)"
                  :key="course.id"
                  class="course-block"
                  :class="getCourseBlockClass(course, getCourseStartsAtSlot(day.value, timeSlot.hour).length)"
                  :style="getMergedCourseStyle(course, index, getCourseStartsAtSlot(day.value, timeSlot.hour).length, timeSlot.hour)"
                  @click.stop="handleCourseBlockClick(course)"
                >
                  <div class="course-name">{{ course.name }}</div>
                  <div class="course-info">{{ course.courseCode }}</div>
                  <div class="course-info">{{ course.crn }}</div>
                  <div class="course-info">{{ course.room }}</div>
                  <div v-if="getCourseStartsAtSlot(day.value, timeSlot.hour).length > 1" class="course-index">
                    {{ index + 1 }}/{{ getCourseStartsAtSlot(day.value, timeSlot.hour).length }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 可拖拽的分隔条 -->
      <div 
        class="resizer"
        @mousedown="startResize"
        :class="{ 'resizing': isResizing }"
      >
        <div class="resizer-handle"></div>
      </div>
      
      <div class="course-sidebar" :style="{ width: `${sidebarWidth}px` }">
        <h3>Available Courses</h3>
        <div class="course-list">
          <div 
            v-for="course in allCourses"
            :key="course.id"
            class="course-item"
            :class="getCourseItemClass(course)"
            @click="handleCourseBlockClick(course)"
          >
            <div class="course-info">
              <div class="course-name">{{ course.name }}</div>
              <div class="course-details">
                <span class="course-code">{{ course.courseCode }}</span>
                <span class="course-crn">{{ course.crn }}</span>
                <span class="course-teacher">{{ course.teacher }}</span>
                <span class="course-time">{{ formatCourseTime(course) }}</span>
                <span class="course-room">{{ course.room }}</span>
              </div>
            </div>
            <div class="course-status">
              <span v-if="course.selected" class="status-badge selected">Selected</span>
              <span v-else-if="isConflicted(course)" class="status-badge conflicted" :title="`Conflicts with ${getConflictedCourse(course)?.name}`">
                Conflicts with {{ getConflictedCourse(course)?.name }}
              </span>
              <span v-else class="status-badge available">Available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 确认对话框 -->
    <div v-if="showConfirmDialog" class="dialog-overlay" @click="cancelReplacement">
      <div class="confirm-dialog" @click.stop>
        <div class="dialog-header">
          <h3>Course Selection Confirmation</h3>
        </div>
        <div class="dialog-content">
          <p>Selecting <strong>{{ pendingCourse?.name }}</strong> will deselect the currently selected <strong>{{ conflictedCourse?.name }}</strong></p>
          <p>Both courses have conflicting time slots: <span class="time-info">{{ formatCourseTime(pendingCourse) }}</span></p>
          <p>Do you want to confirm the replacement?</p>
        </div>
        <div class="dialog-actions">
          <button class="btn-cancel" @click="cancelReplacement">Cancel</button>
          <button class="btn-confirm" @click="confirmReplacement">Confirm Replacement</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { requiredCourses, electiveCourses } from '../data/courses.js'
import { useCourseStore } from '../store/courseStore.js'

// 使用Pinia store
const store = useCourseStore()

// 拖拽调整宽度相关状态
const sidebarWidth = ref(320)
const isResizing = ref(false)
const startX = ref(0)
const startWidth = ref(0)

const weekDays = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 7, label: 'Sunday' }
]

const timeSlots = [
  { hour: 8, label: '08:00-08:50' },
  { hour: 9, label: '09:00-09:50' },
  { hour: 10, label: '10:00-10:50' },
  { hour: 11, label: '11:00-11:50' },
  { hour: 12, label: '12:00-12:50' },
  { hour: 13, label: '13:00-13:50' },
  { hour: 14, label: '14:00-14:50' },
  { hour: 15, label: '15:00-15:50' },
  { hour: 16, label: '16:00-16:50' },
  { hour: 17, label: '17:00-17:50' },
  { hour: 18, label: '18:00-18:50' },
  { hour: 19, label: '19:00-19:50' },
  { hour: 20, label: '20:00-20:50' },
  { hour: 21, label: '21:00-21:50' },
  { hour: 22, label: '22:00-22:50' }
]

// 将原始数据转换为main分支期望的格式
const courses = ref([
  ...requiredCourses.map((course, index) => ({
    id: index + 1,
    name: course.name,
    courseCode: course.code,
    crn: `CRN${1000 + index}`,
    teacher: course.professor,
    time: { 
      day: weekDays.find(d => d.label.toLowerCase().startsWith(course.day.toLowerCase()))?.value || 1, 
      start: course.startHour, 
      end: course.startHour + course.duration 
    },
    room: course.location,
    selected: store.isSelected(course.code),
    credits: 3
  })),
  ...electiveCourses.map((course, index) => ({
    id: requiredCourses.length + index + 1,
    name: course.name,
    courseCode: course.code,
    crn: `CRN${2000 + index}`,
    teacher: course.professor,
    time: { 
      day: weekDays.find(d => d.label.toLowerCase().startsWith(course.day.toLowerCase()))?.value || 1, 
      start: course.startHour, 
      end: course.startHour + course.duration 
    },
    room: course.location,
    selected: store.isSelected(course.code),
    credits: 3
  }))
])

const selectedCourses = computed(() => 
  courses.value.filter(course => course.selected)
)

const allCourses = computed(() => courses.value)

// 确认对话框状态管理
const showConfirmDialog = ref(false)
const pendingCourse = ref(null)
const conflictedCourse = ref(null)

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

// 获取在指定时间段显示的课程
const getCourseStartsAtSlot = (day, hour) => {
  // 获取在该时间段内的所有课程
  const coursesInSlot = getCourseForSlot(day, hour)
  
  if (coursesInSlot.length === 0) {
    return []
  }
  
  if (coursesInSlot.length === 1) {
    // 只有一个课程
    const course = coursesInSlot[0]
    if (course.time.start === hour) {
      // 在开始时间显示
      return [course]
    } else {
      // 检查前一个时间段是否有冲突，如果有冲突则此时间段也需要显示
      const prevHourCourses = getCourseForSlot(course.time.day, hour - 1)
      if (prevHourCourses.length > 1) {
        // 前一时间段有冲突，当前时间段也要显示单个课程
        return [course]
      }
      return []
    }
  }
  
  // 多个课程重叠时，检查冲突时间段
  if (coursesInSlot.length > 1) {
    // 在每个冲突时间段都显示所有冲突课程，但高度只占一格
    return coursesInSlot
  }
  
  return []
}

const getCellClass = (day, hour) => {
  const coursesInSlot = getCourseForSlot(day, hour)
  if (coursesInSlot.length === 0) return ''
  
  const hasSelected = coursesInSlot.some(course => course.selected)
  const hasAvailable = coursesInSlot.some(course => course.available && !course.selected)
  
  return {
    'has-selected': hasSelected,
    'has-available': hasAvailable,
    'has-course': coursesInSlot.length > 0
  }
}

const getCourseBlockClass = (course, totalCount) => {
  const isParallel = totalCount > 1
  
  if (isParallel) {
    return {
      'parallel-display': true,
      'selected': course.selected,
    }
  }
  
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

// 处理时间格子点击事件
const handleCellClick = (day, hour) => {
  // 获取这个时间格子内的所有课程
  const coursesInSlot = getCourseForSlot(day, hour)
  
  if (coursesInSlot.length === 0) {
    return // 没有课程，直接返回
  }
  
  // 如果只有一个课程，直接处理
  if (coursesInSlot.length === 1) {
    handleCourseBlockClick(coursesInSlot[0])
    return
  }
  
  // 如果有多个课程，优先处理已选中的课程
  const selectedCourse = coursesInSlot.find(course => course.selected)
  if (selectedCourse) {
    handleCourseBlockClick(selectedCourse)
    return
  }
  
  // 如果没有已选中的课程，处理第一个可选的课程
  const availableCourse = coursesInSlot.find(course => !course.selected && !isConflicted(course))
  if (availableCourse) {
    handleCourseBlockClick(availableCourse)
    return
  }
  
  // 如果都是冲突课程，处理第一个
  handleCourseBlockClick(coursesInSlot[0])
}

// 处理课程块的直接点击
const handleCourseBlockClick = (course) => {
  if (course.selected) {
    // 点击已选中的课程，直接取消选择
    course.selected = false
    // 同时更新store
    const originalCourse = [...requiredCourses, ...electiveCourses].find(c => c.code === course.courseCode)
    if (originalCourse) {
      store.toggleCourse(originalCourse)
    }
  } else if (isConflicted(course)) {
    // 点击冲突课程，显示替换确认对话框
    const conflicted = getConflictedCourse(course)
    if (conflicted) {
      pendingCourse.value = course
      conflictedCourse.value = conflicted
      showConfirmDialog.value = true
    }
  } else {
    // 点击可选课程，直接选择
    course.selected = true
    // 同时更新store
    const originalCourse = [...requiredCourses, ...electiveCourses].find(c => c.code === course.courseCode)
    if (originalCourse) {
      store.toggleCourse(originalCourse)
    }
  }
}

// 确认替代选择
const confirmReplacement = () => {
  if (pendingCourse.value && conflictedCourse.value) {
    conflictedCourse.value.selected = false
    pendingCourse.value.selected = true
    
    // 更新store
    const pendingOriginal = [...requiredCourses, ...electiveCourses].find(c => c.code === pendingCourse.value.courseCode)
    const conflictedOriginal = [...requiredCourses, ...electiveCourses].find(c => c.code === conflictedCourse.value.courseCode)
    
    if (conflictedOriginal) {
      store.toggleCourse(conflictedOriginal)
    }
    if (pendingOriginal) {
      store.toggleCourse(pendingOriginal)
    }
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

const formatCourseTime = (course) => {
  const dayName = weekDays.find(d => d.value === course.time.day)?.label
  return `${dayName} ${course.time.start}:00-${course.time.end}:50`
}

// 并列显示的课程颜色数组
const conflictColors = [
  { bg: 'rgba(255, 193, 7, 0.15)', border: '#ffc107', text: '#856404' },    // 黄色
  { bg: 'rgba(220, 53, 69, 0.15)', border: '#dc3545', text: '#721c24' },    // 红色
  { bg: 'rgba(40, 167, 69, 0.15)', border: '#28a745', text: '#155724' },    // 绿色
  { bg: 'rgba(111, 66, 193, 0.15)', border: '#6f42c1', text: '#493057' },   // 紫色
  { bg: 'rgba(255, 133, 27, 0.15)', border: '#fd851b', text: '#8a4a00' },   // 橙色
  { bg: 'rgba(32, 201, 151, 0.15)', border: '#20c997', text: '#0f5132' },   // 青色
  { bg: 'rgba(253, 126, 20, 0.15)', border: '#fd7e14', text: '#8b4513' },   // 深橙色
  { bg: 'rgba(108, 117, 125, 0.15)', border: '#6c757d', text: '#495057' }   // 灰色
]

// 为课程分配固定颜色索引（基于课程ID的全局索引）
const getCourseColorIndex = (courseId) => {
  // 直接基于课程ID分配颜色，确保同一课程始终使用相同颜色
  return (courseId - 1) % conflictColors.length
}

// 获取合并单元格课程的样式
const getMergedCourseStyle = (course, index, totalCount, currentHour) => {
  // 获取颜色 - 基于课程ID的全局索引，所有课程都使用彩色样式
  const colorIndex = getCourseColorIndex(course.id)
  const color = conflictColors[colorIndex]
  
  if (totalCount === 1) {
    // 单个课程
    if (course.time.start === currentHour) {
      // 在开始时间格显示，检查后续时间段是否有冲突，如有冲突则缩短高度
      let actualDuration = course.time.end - course.time.start
      
      // 检查每个后续时间段是否有其他课程
      for (let hour = currentHour + 1; hour < course.time.end; hour++) {
        const nextSlotCourses = getCourseForSlot(course.time.day, hour)
        if (nextSlotCourses.length > 1) {
          // 有冲突，缩短到冲突开始位置
          actualDuration = hour - currentHour
          break
        }
      }
      
      return {
        width: '100%',
        height: `${actualDuration * 100}%`,
        zIndex: 10,
        top: '0',
        backgroundColor: color.bg,
        borderColor: color.border,
        color: color.text,
        borderWidth: '1px',
        borderStyle: 'solid'
      }
    } else {
      // 不是开始时间，但前一时间段有冲突，显示单格高度
      return {
        width: '100%',
        height: '100%',
        zIndex: 10,
        top: '0',
        backgroundColor: color.bg,
        borderColor: color.border,
        color: color.text,
        borderWidth: '1px',
        borderStyle: 'solid'
      }
    }
  }
  
  // 多个课程并列显示（冲突情况）
  const width = Math.floor(100 / totalCount)
  const left = index * width
  
  // 冲突时间格只显示当前时间格的高度，确保并列显示
  const height = 100
  
  return {
    position: 'absolute',
    left: `${left}%`,
    width: `${width}%`,
    height: `${height}%`,
    top: '0',
    zIndex: 10 + index,
    backgroundColor: color.bg,
    borderColor: color.border,
    color: color.text,
    borderWidth: '1px',
    borderStyle: 'solid'
  }
}

// 开始拖拽调整
const startResize = (event) => {
  isResizing.value = true
  startX.value = event.clientX
  startWidth.value = sidebarWidth.value
  
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}

// 处理拖拽过程
const handleResize = (event) => {
  if (!isResizing.value) return
  
  const deltaX = startX.value - event.clientX
  const newWidth = startWidth.value + deltaX
  
  // 限制侧边栏宽度在 250px 到 500px 之间
  sidebarWidth.value = Math.max(250, Math.min(500, newWidth))
}

// 停止拖拽
const stopResize = () => {
  isResizing.value = false
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

// 组件挂载时的处理（在CoursePlanning页面中不隐藏滚动条）
onMounted(() => {
  // 只在单独显示WeeklyCalendar时才隐藏页面滚动
  // 检查当前路由，如果不是在CoursePlanning页面就隐藏滚动条
  if (window.location.pathname !== '/planning') {
    document.body.style.overflow = 'hidden'
  }
})

// 组件卸载时恢复页面滚动
onUnmounted(() => {
  if (window.location.pathname !== '/planning') {
    document.body.style.overflow = 'auto'
  }
  // 清理事件监听器
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
})
</script>

<style scoped>
.weekly-calendar {
  padding: 0 20px 20px 0;
  font-family: Arial, sans-serif;
  height: calc(100vh - 40px);
  width: 100%;
  max-width: 100vw;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

/* 在CoursePlanning页面中调整高度和左边距 */
.course-planning .weekly-calendar {
  height: 100vh;
  min-height: 800px;
  padding-left: 0;
  margin-left: 0;
}

.calendar-container {
  display: flex;
  gap: 0;
  width: 100%;
  max-width: 100%;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  box-sizing: border-box;
}

.calendar-main {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
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
  border-radius: 0 0 8px 8px;
}

.time-row {
  flex: 1;
  min-height: 60px;
  display: grid;
  grid-template-columns: 80px repeat(7, minmax(0, 1fr));
  column-gap: 1px;
  row-gap: 0;
  width: 100%;
  min-width: 0;
}

.course-sidebar {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  flex: 0 0 auto;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: 100%;
  min-width: 250px;
}

/* 拖拽分隔条样式 */
.resizer {
  width: 8px;
  background: #f0f0f0;
  cursor: col-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  flex-shrink: 0;
  position: relative;
  height: calc(100% - 16px);
  margin: 8px 0;
}

.resizer:hover {
  background: #e0e0e0;
}

.resizer.resizing {
  background: #2196f3;
}

.resizer-handle {
  width: 2px;
  height: 30px;
  background: #bbb;
  border-radius: 1px;
  transition: background-color 0.2s;
}

.resizer:hover .resizer-handle {
  background: #999;
}

.resizer.resizing .resizer-handle {
  background: white;
}

.calendar-header {
  display: grid;
  grid-template-columns: 80px repeat(7, minmax(0, 1fr));
  gap: 1px;
  background: #e0e0e0;
  flex-shrink: 0;
  width: 100%;
  min-width: 0;
  border-radius: 8px 8px 0 0;
  overflow: hidden;
}

.time-column {
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
}

.day-header {
  background: #f0f0f0;
  padding: 6px;
  text-align: center;
  font-weight: bold;
  font-size: 14px;
}

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
  padding: 0;
  position: relative;
  cursor: default;
  overflow: visible;
  height: 100%;
  min-width: 0;
  width: 100%;
}

.time-cell.has-course {
  cursor: pointer;
}

.course-blocks-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100%;
  z-index: 50;
}

.time-cell.has-selected {
  background: #e3f2fd;
}

.time-cell.has-available {
  background: #f9f9f9;
}

.time-cell.has-course {
  background: #fafafa;
  cursor: pointer;
}

.course-block {
  width: 100%;
  height: 100%;
  min-height: 60px;
  padding: 4px 6px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  text-align: left;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  position: absolute;
  overflow: visible;
  z-index: 100;
  gap: 1px;
  box-sizing: border-box;
  pointer-events: auto;
}

/* 课程状态样式 - 统一使用彩色样式 */
.course-block.selected {
  background: #349bef !important;
  color: white !important;
  border-color: #2196f3 !important;
  box-shadow: 0 2px 4px rgba(33, 150, 243, 0.3) !important;
  transform: scale(1.02);
  opacity: 1 !important;
}

.course-block.available {
  opacity: 0.9;
}

.course-block.conflicted {
  opacity: 0.6;
  cursor: not-allowed !important;
}

/* 并列显示的课程块样式 - 移除默认样式以让内联样式生效 */
.course-block.parallel-display {
  opacity: 1 !important;
  cursor: pointer !important;
}

.course-block.parallel-display.selected {
  background: #2196f3 !important;
  color: white !important;
  border-color: #2196f3 !important;
  box-shadow: 0 2px 4px rgba(33, 150, 243, 0.3) !important;
  transform: scale(1.02);
  opacity: 1 !important;
}

.course-name {
  font-weight: bold;
  margin-bottom: 1px;
  font-size: 12px;
  line-height: 1.2;
  white-space: normal;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
  width: 100%;
  max-height: 2.4em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
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
  line-height: 1.1;
  text-align: left;
  word-wrap: break-word;
  width: 100%;
  margin: 0;
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