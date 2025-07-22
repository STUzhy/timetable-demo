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
              @click="handleCellClick(day.value, timeSlot.hour, $event)"
            >
              <div class="course-blocks-container">
                <!-- 只在课程开始时间显示完整的课程块 -->
                <div 
                  v-for="(course, index) in getCourseStartsAtSlot(day.value, timeSlot.hour)"
                  :key="`${course.id}-${day.value}-${timeSlot.hour}`"
                  class="course-block"
                  :style="getMergedCourseStyle(course, index, getCourseStartsAtSlot(day.value, timeSlot.hour).length)"
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
              <span v-if="course.selected && selectedCourses.filter(sc => sc.id !== course.id && isTimeConflict(course, sc)).length === 0" class="status-badge selected">Selected</span>
              <span v-else-if="course.selected && selectedCourses.filter(sc => sc.id !== course.id && isTimeConflict(course, sc)).length > 0" class="status-badge conflicted">
                Time Conflict
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
  { hour: 8, label: '08:00-09:00' },
  { hour: 9, label: '09:00-10:00' },
  { hour: 10, label: '10:00-11:00' },
  { hour: 11, label: '11:00-12:00' },
  { hour: 12, label: '12:00-13:00' },
  { hour: 13, label: '13:00-14:00' },
  { hour: 14, label: '14:00-15:00' },
  { hour: 15, label: '15:00-16:00' },
  { hour: 16, label: '16:00-17:00' },
  { hour: 17, label: '17:00-18:00' },
  { hour: 18, label: '18:00-19:00' },
  { hour: 19, label: '19:00-20:00' },
  { hour: 20, label: '20:00-21:00' },
  { hour: 21, label: '21:00-22:00' }
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
  // 只在课程开始时间显示完整的课程块
  return courses.value.filter(course => 
    course.time.day === day && 
    course.time.start === hour
  )
}

const getCellClass = (day, hour) => {
  const coursesInSlot = getCourseForSlot(day, hour)
  if (coursesInSlot.length === 0) return ''
  
  const hasSelected = coursesInSlot.some(course => course.selected)
  const hasAvailable = coursesInSlot.some(course => !course.selected && !isConflicted(course))
  const hasConflicted = coursesInSlot.some(course => !course.selected && isConflicted(course))
  
  return {
    'has-selected': hasSelected,
    'has-available': hasAvailable,
    'has-conflicted': hasConflicted,
    'has-course': coursesInSlot.length > 0
  }
}

const getCourseItemClass = (course) => {
  if (course.selected) {
    const conflictingSelectedCourses = selectedCourses.value.filter(selectedCourse => 
      selectedCourse.id !== course.id && isTimeConflict(course, selectedCourse)
    )
    
    return {
      'selected': conflictingSelectedCourses.length === 0,
      'conflicted': conflictingSelectedCourses.length > 0,
      'available': false
    }
  } else {
    // 检查未选中的课程是否与已选课程冲突
    const hasConflictWithSelected = selectedCourses.value.some(selectedCourse => 
      isTimeConflict(course, selectedCourse)
    )
    
    return {
      'selected': false,
      'conflicted': hasConflictWithSelected,
      'available': !hasConflictWithSelected
    }
  }
}

// 处理时间格子点击事件
const handleCellClick = (day, hour, event) => {
  console.log('🔥 Cell clicked:', { 
    day, 
    hour, 
    target: event?.target?.className,
    targetTag: event?.target?.tagName 
  })
  
  // 获取这个时间格子内的所有课程
  const coursesInSlot = getCourseForSlot(day, hour)
  console.log('📚 Courses in slot:', coursesInSlot.map(c => ({ 
    name: c.name, 
    start: c.time.start, 
    selected: c.selected,
    conflicted: isConflicted(c)
  })))
  
  // 详细分析每个课程的状态
  const selectedCourse = coursesInSlot.find(course => course.selected)
  const availableCourse = coursesInSlot.find(course => !course.selected && !isConflicted(course))
  const conflictedCourses = coursesInSlot.filter(course => !course.selected && isConflicted(course))
  
  console.log('📊 Course analysis:', {
    selectedCourse: selectedCourse?.name || 'None',
    availableCourse: availableCourse?.name || 'None', 
    conflictedCourses: conflictedCourses.map(c => c.name),
    totalCourses: coursesInSlot.length
  })
  
  if (coursesInSlot.length === 0) {
    console.log('❌ No courses in slot, returning')
    return // 没有课程，直接返回
  }
  
  // 如果只有一个课程，直接处理
  if (coursesInSlot.length === 1) {
    console.log('✅ Single course, handling directly:', coursesInSlot[0].name)
    handleCourseBlockClick(coursesInSlot[0])
    return
  }
  
  // 如果有多个课程，应该根据点击位置来选择，而不是优先处理已选中的课程
  // 这样用户可以通过点击不同位置来选择不同的课程（包括已选中的和未选中的）
  
  // 如果有多个课程，根据点击位置确定选择哪个课程
  console.log('🔴 Multiple courses detected, calculating position...')
  if (event && coursesInSlot.length > 1) {
    // 找到真正的time-cell元素来计算点击位置
    let timeCellElement = event.target
    let searchDepth = 0
    console.log('🔍 Searching for time-cell element...')
    
    while (timeCellElement && !timeCellElement.classList.contains('time-cell') && searchDepth < 5) {
      console.log(`  - Element ${searchDepth}:`, {
        tag: timeCellElement.tagName,
        classes: timeCellElement.className
      })
      timeCellElement = timeCellElement.parentElement
      searchDepth++
    }
    
    if (timeCellElement && timeCellElement.classList.contains('time-cell')) {
      const rect = timeCellElement.getBoundingClientRect()
      const clickX = event.clientX - rect.left
      const cellWidth = rect.width
      const courseWidth = cellWidth / coursesInSlot.length
      const clickedIndex = Math.floor(clickX / courseWidth)
      const safeIndex = Math.min(Math.max(0, clickedIndex), coursesInSlot.length - 1)
      
      console.log('📍 Position calculation:', {
        timeCellFound: true,
        clickX,
        cellWidth,
        courseWidth,
        coursesLength: coursesInSlot.length,
        clickedIndex,
        safeIndex,
        selectedCourse: coursesInSlot[safeIndex]?.name
      })
      
      handleCourseBlockClick(coursesInSlot[safeIndex])
    } else {
      console.log('⚠️ Could not find time-cell element after search, using first course')
      console.log('Final element:', timeCellElement ? {
        tag: timeCellElement.tagName,
        classes: timeCellElement.className
      } : 'null')
      handleCourseBlockClick(coursesInSlot[0])
    }
  } else {
    // 如果没有事件信息或只有一个课程
    if (coursesInSlot.length === 1) {
      console.log('📱 Single course fallback, handling:', coursesInSlot[0].name)
      handleCourseBlockClick(coursesInSlot[0])
    } else if (selectedCourse) {
      // 如果有多个课程但没有位置信息，优先处理已选中的课程
      console.log('⭐ Multiple courses but no position, handling selected:', selectedCourse.name)
      handleCourseBlockClick(selectedCourse)
    } else if (availableCourse) {
      console.log('🟢 Multiple courses but no position, handling available:', availableCourse.name)
      handleCourseBlockClick(availableCourse)
    } else {
      console.log('🔴 Multiple courses but no position, handling first:', coursesInSlot[0]?.name)
      handleCourseBlockClick(coursesInSlot[0])
    }
  }
}

// 处理课程块的直接点击
const handleCourseBlockClick = (course) => {
  const conflicted = isConflicted(course)
  const conflictedWithCourse = getConflictedCourse(course)
  
  console.log('🎯 Course block clicked:', { 
    name: course.name, 
    selected: course.selected, 
    conflicted: conflicted,
    conflictedWithCourse: conflictedWithCourse?.name || 'None'
  })
  
  if (course.selected) {
    console.log('🔄 Deselecting course:', course.name)
    // 点击已选中的课程，直接取消选择
    course.selected = false
    // 同时更新store
    const originalCourse = [...requiredCourses, ...electiveCourses].find(c => c.code === course.courseCode)
    if (originalCourse) {
      store.toggleCourse(originalCourse)
    }
  } else if (conflicted) {
    console.log('⚠️ Course is conflicted, showing dialog. Conflicted with:', conflictedWithCourse?.name)
    // 点击冲突课程，显示替换确认对话框
    if (conflictedWithCourse) {
      pendingCourse.value = course
      conflictedCourse.value = conflictedWithCourse
      showConfirmDialog.value = true
      console.log('📋 Dialog should show now')
    } else {
      console.log('❌ No conflicted course found, this should not happen')
    }
  } else {
    console.log('✅ Course is available, selecting directly')
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
  return `${dayName} ${course.time.start}:00-${course.time.end}:00`
}

// Simple 3-color system for clear visual feedback
const getSimpleColorStyle = (course) => {
  const isSelected = course.selected
  
  // Check if this course conflicts with any selected course
  const hasConflictWithSelected = selectedCourses.value.some(selectedCourse => 
    selectedCourse.id !== course.id && isTimeConflict(course, selectedCourse)
  )
  
  if (isSelected) {
    // Selected course - blue if no conflicts, red if conflicts
    if (hasConflictWithSelected) {
      return {
        backgroundColor: '#BF616A', // Nord11 - Red (conflict)
        borderColor: '#BF616A',
        color: '#ECEFF4', // Nord6 - Light text
        opacity: '1'
      }
    } else {
      return {
        backgroundColor: '#81A1C1', // Nord9 - Brighter blue (selected, no conflict)
        borderColor: '#81A1C1', 
        color: '#ECEFF4', // Nord6 - Light text
        opacity: '1'
      }
    }
  } else {
    // Not selected course - red if conflicts with selected, green if available
    if (hasConflictWithSelected) {
      return {
        backgroundColor: '#BF616A', // Nord11 - Red (conflicts with selected)
        borderColor: '#BF616A',
        color: '#ECEFF4', // Nord6 - Light text
        opacity: '1'
      }
    } else {
      return {
        backgroundColor: '#A3BE8C', // Nord14 - Green (available)
        borderColor: '#A3BE8C',
        color: '#2E3440', // Nord0 - Dark text
        opacity: '1'
      }
    }
  }
}

// 获取合并单元格课程的样式
const getMergedCourseStyle = (course, index, totalCount) => {
  const colorStyle = getSimpleColorStyle(course)
  
  if (totalCount === 1) {
    // 单个课程 - 显示完整的课程块跨越多个小时
    const duration = course.time.end - course.time.start
    
    return {
      width: '100%',
      height: `${duration * 100}%`,
      zIndex: 200,
      top: '0',
      backgroundColor: colorStyle.backgroundColor,
      borderColor: colorStyle.borderColor,
      color: colorStyle.color,
      opacity: colorStyle.opacity,
    }
  }
  
  // 多个课程并列显示（冲突情况）- 每个课程显示完整的高度跨越
  const width = Math.floor(100 / totalCount)
  const left = index * width
  const duration = course.time.end - course.time.start
  
  return {
    position: 'absolute',
    left: `${left}%`,
    width: `${width}%`,
    height: `${duration * 100}%`,
    top: '0',
    zIndex: 200 + index,
    backgroundColor: colorStyle.backgroundColor,
    borderColor: colorStyle.borderColor,
    color: colorStyle.color,
    opacity: colorStyle.opacity,
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
  z-index: 150; /* Ensure container is above grid */
}

.time-cell.has-selected {
  background: var(--nord8);
  opacity: 1;
}

.time-cell.has-available {
  background: var(--nord14);
  border-radius: 4px;
}

.time-cell.has-conflicted {
  background: var(--nord4);
  opacity: 1;
}

.time-cell.has-course {
  background: #fafafa;
  cursor: pointer;
}

/* MUST HAVE: Simple 3-Color Course Block System */
.course-block {
  width: 100%;
  height: 100%;
  min-height: 60px;
  padding: 6px 8px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  text-align: left;
  box-shadow: 0 2px 4px rgba(0,0,0,0.15);
  transition: all 0.2s ease;
  position: absolute;
  overflow: visible;
  z-index: 200;
  gap: 2px;
  box-sizing: border-box;
  pointer-events: auto;
  font-weight: 500;
}

/* Hover effect for better interactivity */
.course-block:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
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
  background: #81A1C1; /* Nord9 - Brighter blue */
  border-color: #81A1C1;
  color: #ECEFF4;
  box-shadow: 0 2px 6px rgba(129, 161, 193, 0.3);
}

.course-item.conflicted {
  background: #BF616A; /* Nord11 - Red */
  border-color: #BF616A;
  color: #ECEFF4;
  cursor: pointer; /* Allow clicking to deselect */
  opacity: 1;
}

.course-item.available {
  border-color: var(--nord14);
  background: rgba(163, 190, 140, 0.05);
}

.course-item.available:hover {
  background: rgba(163, 190, 140, 0.1);
  border-color: var(--nord15);
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
  background: #81A1C1; /* Nord9 - Brighter blue */
  color: white;
}

.status-badge.available {
  background: var(--nord14);
  color: white;
}

.status-badge.conflicted {
  background: #BF616A; /* Nord11 - Red */
  color: #ECEFF4;
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
  background: var(--nord4);
  color: var(--nord2);
}

.btn-cancel:hover {
  background: var(--nord3);
}

.btn-confirm {
  background: var(--nord10);
  color: white;
}

.btn-confirm:hover {
  background: var(--nord9);
}
</style>