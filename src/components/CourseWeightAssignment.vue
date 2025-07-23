<template>
  <div class="course-weight-assignment">
    <div class="weight-header">
      <h2>Course Weight Assignment</h2>
      <div class="weight-summary">
        <span class="total-points" :class="{ 'valid': isValidTotal, 'invalid': !isValidTotal }">
          {{ totalPoints }}/100 Points
        </span>
        <div class="validation-message" v-if="!isValidTotal">
          {{ validationMessage }}
        </div>
      </div>
    </div>

    <div class="weight-container">
      <!-- Selected Courses Weight Assignment -->
      <div class="weight-section" v-if="selectedCourses.length > 0">
        <h3>Selected Courses - Assign Priority Weights</h3>
        <div class="course-weight-list">
          <div 
            v-for="course in selectedCourses" 
            :key="course.code"
            class="course-weight-item"
          >
            <div class="course-info">
              <div class="course-header">
                <span class="course-code">{{ course.code }}</span>
                <span class="course-type" :class="courseTypeClass(course)">
                  {{ getCourseType(course) }}
                </span>
              </div>
              <div class="course-name">{{ course.name }}</div>
              <div class="course-details">
                <span>{{ course.professor }}</span>
                <span>{{ course.day }} {{ course.startHour }}:00-{{ course.startHour + course.duration }}:00</span>
              </div>
            </div>
            
            <div class="weight-controls">
              <div class="weight-input-group">
                <label>Priority Weight:</label>
                <div class="weight-slider-container">
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    v-model.number="courseWeights[course.code]"
                    @input="handleWeightChange"
                    class="weight-slider"
                  />
                  <input 
                    type="number" 
                    min="0" 
                    max="100" 
                    v-model.number="courseWeights[course.code]"
                    @input="handleWeightChange"
                    class="weight-number-input"
                  />
                </div>
                <div class="weight-percentage">
                  {{ getWeightPercentage(course.code) }}%
                </div>
              </div>
              
              <div class="priority-indicator">
                <span class="priority-label">{{ getPriorityLabel(course.code) }}</span>
                <div class="priority-bar" :style="getPriorityBarStyle(course.code)"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No Courses Selected Message -->
      <div class="no-courses" v-else>
        <div class="empty-state">
          <div class="empty-icon">⚖️</div>
          <h3>No Courses Selected</h3>
          <p>Please select courses from the calendar to assign priority weights.</p>
          <p>Weights help the system understand your preferences when allocating courses.</p>
        </div>
      </div>

      <!-- Weight Distribution Chart -->
      <div class="weight-chart-section" v-if="selectedCourses.length > 0">
        <h3>Weight Distribution Overview</h3>
        <div class="weight-chart">
          <div class="chart-container">
            <div 
              v-for="course in selectedCourses" 
              :key="course.code"
              class="chart-bar"
              :style="getChartBarStyle(course.code)"
              :title="`${course.code}: ${courseWeights[course.code]} points`"
            >
              <div class="chart-label">{{ course.code }}</div>
              <div class="chart-value">{{ courseWeights[course.code] }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="weight-actions" v-if="selectedCourses.length > 0">
        <button @click="distributeEvenly" class="action-btn distribute-btn">
          Distribute Evenly
        </button>
        <button @click="prioritizeRequired" class="action-btn prioritize-btn">
          Prioritize Required Courses
        </button>
        <button 
          @click="optimizeToHundred" 
          :disabled="totalPoints === 0"
          class="action-btn optimize-btn"
        >
          Optimize to 100
        </button>
        <button @click="resetWeights" class="action-btn reset-btn">
          Reset All Weights
        </button>
        <button 
          @click="saveWeights" 
          :disabled="!isValidTotal"
          class="action-btn save-btn"
          :class="{ 'saved': weightsSaved }"
        >
          {{ weightsSaved ? 'Weights Saved' : 'Save Weights' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useCourseStore } from '../store/courseStore.js'
import { requiredCourses, electiveCourses } from '../data/courses.js'

const store = useCourseStore()
const courseWeights = ref({})
const weightsSaved = ref(false)

// Get selected courses with full details
const selectedCourses = computed(() => {
  return [...requiredCourses, ...electiveCourses].filter(course => 
    store.isSelected(course.code)
  )
})

// Calculate total points
const totalPoints = computed(() => {
  return Object.values(courseWeights.value).reduce((sum, weight) => sum + (weight || 0), 0)
})

// Validation
const isValidTotal = computed(() => {
  return totalPoints.value === 100 && selectedCourses.value.length > 0
})

const validationMessage = computed(() => {
  if (selectedCourses.value.length === 0) return ''
  if (totalPoints.value < 100) return `Need ${100 - totalPoints.value} more points`
  if (totalPoints.value > 100) return `Exceeded by ${totalPoints.value - 100} points`
  return 'Perfect! Total is 100 points'
})

// Helper functions
const getCourseType = (course) => {
  return requiredCourses.some(req => req.code === course.code) ? 'Required' : 'Elective'
}

const courseTypeClass = (course) => {
  return getCourseType(course) === 'Required' ? 'required-type' : 'elective-type'
}

const getWeightPercentage = (courseCode) => {
  const weight = courseWeights.value[courseCode] || 0
  return totalPoints.value > 0 ? Math.round((weight / totalPoints.value) * 100) : 0
}

const getPriorityLabel = (courseCode) => {
  const weight = courseWeights.value[courseCode] || 0
  if (weight >= 20) return 'High Priority'
  if (weight >= 10) return 'Medium Priority'
  if (weight >= 5) return 'Low Priority'
  return 'No Priority'
}

const getPriorityBarStyle = (courseCode) => {
  const weight = courseWeights.value[courseCode] || 0
  const percentage = Math.min((weight / 25) * 100, 100) // Scale to max 25 for full bar
  
  let color = 'var(--nord3)'
  if (weight >= 20) color = 'var(--nord11)' // High - red
  else if (weight >= 10) color = 'var(--nord13)' // Medium - yellow  
  else if (weight >= 5) color = 'var(--nord14)' // Low - green
  
  return {
    width: `${percentage}%`,
    backgroundColor: color,
    transition: 'all 0.3s ease'
  }
}

const getChartBarStyle = (courseCode) => {
  const weight = courseWeights.value[courseCode] || 0
  const maxWeight = Math.max(...Object.values(courseWeights.value), 1)
  const heightPercentage = (weight / maxWeight) * 100
  
  return {
    height: `${Math.max(heightPercentage, 5)}%`,
    backgroundColor: getCourseType(selectedCourses.value.find(c => c.code === courseCode)) === 'Required' 
      ? 'var(--nord12)' : 'var(--nord10)',
    transition: 'all 0.3s ease'
  }
}

// Weight management functions
const handleWeightChange = () => {
  weightsSaved.value = false
  // Auto-save to localStorage for persistence and to store
  const weightsKey = store.getUserStorageKey ? store.getUserStorageKey('courseWeights') : 'courseWeights'
  localStorage.setItem(weightsKey, JSON.stringify(courseWeights.value))
  // Also save to store immediately
  store.saveWeights(courseWeights.value)
}

const distributeEvenly = () => {
  const evenWeight = Math.floor(100 / selectedCourses.value.length)
  const remainder = 100 - (evenWeight * selectedCourses.value.length)
  
  selectedCourses.value.forEach((course, index) => {
    courseWeights.value[course.code] = index < remainder ? evenWeight + 1 : evenWeight
  })
  handleWeightChange()
}

const prioritizeRequired = () => {
  const requiredCount = selectedCourses.value.filter(c => getCourseType(c) === 'Required').length
  const electiveCount = selectedCourses.value.length - requiredCount
  
  if (requiredCount === 0) return
  
  // Give 80% weight to required courses, 20% to electives for stronger prioritization
  const requiredWeight = Math.floor(80 / requiredCount)
  const electiveWeight = electiveCount > 0 ? Math.floor(20 / electiveCount) : 0
  
  selectedCourses.value.forEach(course => {
    courseWeights.value[course.code] = getCourseType(course) === 'Required' ? requiredWeight : electiveWeight
  })
  
  // Distribute any remainder to first required course
  const totalAssigned = Object.values(courseWeights.value).reduce((sum, w) => sum + w, 0)
  if (totalAssigned < 100) {
    const firstRequired = selectedCourses.value.find(c => getCourseType(c) === 'Required')
    if (firstRequired) {
      courseWeights.value[firstRequired.code] += (100 - totalAssigned)
    }
  }
  handleWeightChange()
}

const resetWeights = () => {
  selectedCourses.value.forEach(course => {
    courseWeights.value[course.code] = 0
  })
  handleWeightChange()
}

const optimizeToHundred = () => {
  const currentTotal = totalPoints.value
  if (currentTotal === 0 || selectedCourses.value.length === 0) return
  
  // 使用更智能的分配算法：最大余数法（汉密尔顿方法）
  const scaleFactor = 100 / currentTotal
  
  // 计算每个课程的精确分配和取整后的分配
  const courseData = selectedCourses.value.map(course => {
    const currentWeight = courseWeights.value[course.code] || 0
    const exactValue = currentWeight * scaleFactor
    const floorValue = Math.floor(exactValue)
    const remainder = exactValue - floorValue
    
    return {
      course,
      currentWeight,
      exactValue,
      floorValue,
      remainder
    }
  })
  
  // 第一步：分配取整后的值
  let assignedTotal = 0
  courseData.forEach(data => {
    courseWeights.value[data.course.code] = data.floorValue
    assignedTotal += data.floorValue
  })
  
  // 第二步：将剩余的分数按余数大小分配
  const remaining = 100 - assignedTotal
  
  // 按余数从大到小排序，余数相同时随机排序以避免系统性偏差
  courseData.sort((a, b) => {
    const remainderDiff = b.remainder - a.remainder
    if (Math.abs(remainderDiff) < 0.0001) {
      // 余数相同时，为了更公平的分配，使用课程代码排序
      return a.course.code.localeCompare(b.course.code)
    }
    return remainderDiff
  })
  
  // 给余数最大的课程各加1分，直到总和为100
  for (let i = 0; i < remaining; i++) {
    courseWeights.value[courseData[i].course.code] += 1
  }
  
  handleWeightChange()
}

const saveWeights = () => {
  if (!isValidTotal.value) return
  
  // Save to store
  store.saveWeights(courseWeights.value)
  weightsSaved.value = true
  
  setTimeout(() => {
    weightsSaved.value = false
  }, 2000)
}

// Initialize weights for new courses
watch(selectedCourses, (newCourses, oldCourses) => {
  newCourses.forEach(course => {
    if (!(course.code in courseWeights.value)) {
      courseWeights.value[course.code] = 0
    }
  })
  
  // Remove weights for unselected courses
  if (oldCourses) {
    const newCodes = new Set(newCourses.map(c => c.code))
    Object.keys(courseWeights.value).forEach(code => {
      if (!newCodes.has(code)) {
        delete courseWeights.value[code]
      }
    })
  }
}, { immediate: true })

// Load saved weights on mount
onMounted(() => {
  try {
    // Load from store first
    courseWeights.value = { ...store.courseWeights }
    
    // If no weights in store, try localStorage as fallback
    if (Object.keys(courseWeights.value).length === 0) {
      const weightsKey = store.getUserStorageKey ? store.getUserStorageKey('courseWeights') : 'courseWeights'
      const saved = localStorage.getItem(weightsKey)
      if (saved) {
        courseWeights.value = JSON.parse(saved)
        // Save to store for consistency
        store.saveWeights(courseWeights.value)
      }
    }
  } catch (error) {
    console.error('Failed to load saved weights:', error)
  }
})
</script>

<style scoped>
.course-weight-assignment {
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px var(--shadow);
}

.weight-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--nord4);
}

.weight-header h2 {
  color: var(--text);
  margin: 0;
  font-size: 1.5rem;
}

.weight-summary {
  text-align: right;
}

.total-points {
  font-size: 1.5rem;
  font-weight: bold;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.total-points.valid {
  background: var(--nord14);
  color: white;
}

.total-points.invalid {
  background: var(--nord11);
  color: white;
}

.validation-message {
  font-size: 0.9rem;
  margin-top: 0.5rem;
  color: var(--nord11);
  font-weight: 500;
}

.weight-section h3 {
  color: var(--text);
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.course-weight-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.course-weight-item {
  display: grid;
  grid-template-columns: 2fr 3fr;
  gap: 1.5rem;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  transition: all 0.2s ease;
}

.course-weight-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-color: var(--nord8);
}

.course-info .course-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.course-code {
  font-weight: bold;
  color: var(--text);
  font-size: 1rem;
}

.course-type {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
}

.required-type {
  background: var(--nord12);
  color: white;
}

.elective-type {
  background: var(--nord10);
  color: white;
}

.course-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 0.5rem;
}

.course-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.9rem;
  color: var(--text);
  opacity: 0.7;
}

.weight-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.weight-input-group label {
  display: block;
  font-weight: bold;
  color: var(--text);
  margin-bottom: 0.5rem;
}

.weight-slider-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.weight-slider {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: var(--nord4);
  outline: none;
  -webkit-appearance: none;
}

.weight-slider::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--nord10);
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.weight-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--nord10);
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.weight-number-input {
  width: 60px;
  padding: 0.25rem;
  border: 1px solid var(--nord4);
  border-radius: 4px;
  text-align: center;
  font-weight: bold;
}

.weight-percentage {
  font-size: 0.9rem;
  color: var(--text);
  opacity: 0.7;
  text-align: right;
}

.priority-indicator {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.priority-label {
  font-size: 0.8rem;
  font-weight: bold;
  color: var(--text);
}

.priority-bar {
  height: 6px;
  border-radius: 3px;
  background: var(--nord4);
  transition: all 0.3s ease;
}

.no-courses {
  text-align: center;
  padding: 3rem 2rem;
}

.empty-state .empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: var(--text);
  margin-bottom: 1rem;
}

.empty-state p {
  color: var(--text);
  opacity: 0.7;
  line-height: 1.5;
  margin-bottom: 0.5rem;
}

.weight-chart-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--nord4);
}

.weight-chart {
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid var(--nord4);
}

.chart-container {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  height: 200px;
  padding: 1rem 0;
}

.chart-bar {
  flex: 1;
  min-height: 20px;
  border-radius: 4px 4px 0 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  position: relative;
  cursor: pointer;
}

.chart-label {
  position: absolute;
  bottom: -25px;
  font-size: 0.8rem;
  font-weight: bold;
  color: var(--text);
  white-space: nowrap;
}

.chart-value {
  position: absolute;
  top: -25px;
  font-size: 0.8rem;
  font-weight: bold;
  color: var(--text);
}

.weight-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--nord4);
}

.action-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.distribute-btn {
  background: var(--nord8);
  color: white;
}

.distribute-btn:hover {
  background: var(--nord7);
  transform: translateY(-2px);
}

.prioritize-btn {
  background: var(--nord12);
  color: white;
}

.prioritize-btn:hover {
  background: var(--nord11);
  transform: translateY(-2px);
}

.optimize-btn {
  background: var(--nord9);
  color: white;
}

.optimize-btn:hover:not(:disabled) {
  background: var(--nord8);
  transform: translateY(-2px);
}

.optimize-btn:disabled {
  background: var(--nord4);
  color: var(--nord3);
  cursor: not-allowed;
}

.reset-btn {
  background: var(--nord3);
  color: white;
}

.reset-btn:hover {
  background: var(--nord2);
  transform: translateY(-2px);
}

.save-btn {
  background: var(--nord14);
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: var(--nord15);
  transform: translateY(-2px);
}

.save-btn:disabled {
  background: var(--nord4);
  color: var(--nord3);
  cursor: not-allowed;
}

.save-btn.saved {
  background: var(--nord14);
  opacity: 0.8;
}

@media (max-width: 768px) {
  .course-weight-item {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .weight-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .weight-actions {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
  }
}
</style>
