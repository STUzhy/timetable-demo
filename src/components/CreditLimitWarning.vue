<template>
  <div class="credit-limit-warning">
    <div class="credit-header">
      <h2>Course Selection Limit</h2>
      <div class="limit-summary" :class="limitStatusClass">
        <span class="selected-count">{{ selectedCourses.length }}/6</span>
        <span class="limit-label">Courses Selected</span>
      </div>
    </div>

    <!-- Progress Bar Integration -->
    <div class="progress-container">
      <div class="progress-bar">
        <div
          class="progress-fill"
          :style="{ width: progress + '%' }"
        ></div>
      </div>
      <p class="progress-label">{{ selectedCourses.length }} / 6 Courses Selected (5 Primary + 1 Backup)</p>
    </div>

    <!-- Main Selection Status -->
    <div class="selection-breakdown">
      <div class="primary-courses">
        <h3>
          <span class="icon">📚</span>
          Primary Courses ({{ primaryCourses.length }}/5)
        </h3>
        <div class="course-grid" v-if="primaryCourses.length > 0">
          <div 
            v-for="course in primaryCourses" 
            :key="course.code"
            class="course-card primary"
          >
            <div class="course-header">
              <span class="course-code">{{ course.code }}</span>
              <button 
                @click="toggleBackupStatus(course)"
                class="backup-toggle"
                title="Move to backup"
              >
                ⬇️
              </button>
            </div>
            <div class="course-name">{{ course.name }}</div>
            <div class="course-details">
              <span>{{ course.professor }}</span>
              <span>{{ course.day }} {{ course.startHour }}:00</span>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <p>No primary courses selected yet</p>
        </div>
      </div>

      <div class="backup-courses">
        <h3>
          <span class="icon">🔄</span>
          Backup Course ({{ backupCourses.length }}/1)
        </h3>
        <div class="course-grid" v-if="backupCourses.length > 0">
          <div 
            v-for="course in backupCourses" 
            :key="course.code"
            class="course-card backup"
          >
            <div class="course-header">
              <span class="course-code">{{ course.code }}</span>
              <div class="backup-badge">BACKUP</div>
              <button 
                @click="toggleBackupStatus(course)"
                class="primary-toggle"
                title="Move to primary"
              >
                ⬆️
              </button>
            </div>
            <div class="course-name">{{ course.name }}</div>
            <div class="course-details">
              <span>{{ course.professor }}</span>
              <span>{{ course.day }} {{ course.startHour }}:00</span>
            </div>
          </div>
        </div>
        <div v-else class="empty-state backup">
          <p>No backup course selected</p>
          <small>Select a backup course in case your primary choices aren't available</small>
        </div>
      </div>
    </div>

    <!-- Warning Messages -->
    <div class="warning-messages" v-if="warningMessages.length > 0">
      <div 
        v-for="(message, index) in warningMessages" 
        :key="index"
        class="warning-item"
        :class="message.type"
      >
        <span class="warning-icon">{{ message.icon }}</span>
        <span class="warning-text">{{ message.text }}</span>
      </div>
    </div>

    <!-- Selection Guidance -->
    <div class="selection-guidance">
      <h3>📋 Selection Guidelines</h3>
      <ul class="guidelines-list">
        <li class="guideline-item">
          <strong>Primary Courses (5 max):</strong> These are the courses you will definitely take this semester
        </li>
        <li class="guideline-item">
          <strong>Backup Course (1 max):</strong> Alternative course in case a primary course becomes unavailable
        </li>
        <li class="guideline-item">
          <strong>Total Limit:</strong> Select exactly 6 courses (5 primary + 1 backup) for optimal scheduling
        </li>
      </ul>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions" v-if="selectedCourses.length > 0">
      <button 
        @click="autoArrangeSelections" 
        class="action-btn auto-arrange"
        :disabled="selectedCourses.length < 2"
      >
        🎯 Auto-Arrange (5+1)
      </button>
      <button 
        @click="clearAllSelections" 
        class="action-btn clear-all"
      >
        🗑️ Clear All
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useCourseStore } from '../store/courseStore.js'
import { requiredCourses, electiveCourses } from '../data/courses.js'

const store = useCourseStore()
const backupCourseIds = ref(new Set()) // Track which courses are marked as backup

// Get selected courses with full details
const selectedCourses = computed(() => {
  return [...requiredCourses, ...electiveCourses].filter(course => 
    store.isSelected(course.code)
  )
})

// Separate primary and backup courses
const primaryCourses = computed(() => {
  return selectedCourses.value.filter(course => !backupCourseIds.value.has(course.code))
})

const backupCourses = computed(() => {
  return selectedCourses.value.filter(course => backupCourseIds.value.has(course.code))
})

// Progress bar calculation
const progress = computed(() => {
  return (selectedCourses.value.length / 6) * 100
})

// Limit status styling
const limitStatusClass = computed(() => {
  const total = selectedCourses.value.length
  const primary = primaryCourses.value.length
  const backup = backupCourses.value.length
  
  if (total === 0) return 'empty'
  if (total > 6) return 'exceeded'
  if (primary === 5 && backup === 1) return 'perfect'
  if (total === 6) return 'complete'
  return 'in-progress'
})

// Warning messages
const warningMessages = computed(() => {
  const messages = []
  const total = selectedCourses.value.length
  const primary = primaryCourses.value.length
  const backup = backupCourses.value.length

  // Exceeded total limit
  if (total > 6) {
    messages.push({
      type: 'error',
      icon: '🚫',
      text: `Too many courses selected! Remove ${total - 6} course(s). Maximum is 6 total.`
    })
  }

  // Too many primary courses
  if (primary > 5) {
    messages.push({
      type: 'error',
      icon: '⚠️',
      text: `Too many primary courses! Move ${primary - 5} to backup or remove them. Maximum is 5 primary.`
    })
  }

  // Too many backup courses
  if (backup > 1) {
    messages.push({
      type: 'error',
      icon: '⚠️',
      text: `Too many backup courses! Keep only 1 backup course. Remove ${backup - 1} backup(s).`
    })
  }

  // Approaching limits (warnings)
  if (total === 5 && backup === 0) {
    messages.push({
      type: 'warning',
      icon: '💡',
      text: 'Consider selecting 1 backup course for optimal scheduling flexibility.'
    })
  }

  // Perfect selection
  if (primary === 5 && backup === 1) {
    messages.push({
      type: 'success',
      icon: '✅',
      text: 'Perfect! You have selected 5 primary courses and 1 backup course.'
    })
  }

  // Need more courses
  if (total < 5) {
    messages.push({
      type: 'info',
      icon: 'ℹ️',
      text: `Select ${5 - total} more course(s) to reach the recommended minimum of 5 courses.`
    })
  }

  return messages
})

// Toggle course between primary and backup status
const toggleBackupStatus = (course) => {
  const courseCode = course.code
  
  if (backupCourseIds.value.has(courseCode)) {
    // Moving from backup to primary
    if (primaryCourses.value.length >= 5) {
      alert('Cannot move to primary: Maximum 5 primary courses allowed')
      return
    }
    backupCourseIds.value.delete(courseCode)
  } else {
    // Moving from primary to backup
    if (backupCourses.value.length >= 1) {
      alert('Cannot move to backup: Maximum 1 backup course allowed')
      return
    }
    backupCourseIds.value.add(courseCode)
  }
  
  // Save backup status to localStorage
  saveCourseStatuses()
}

// Auto-arrange selections to optimal 5+1 distribution
const autoArrangeSelections = () => {
  if (selectedCourses.value.length < 2) return
  
  // Clear current backup assignments
  backupCourseIds.value.clear()
  
  // If we have more than 6 courses, keep only first 6
  const coursesToKeep = selectedCourses.value.slice(0, 6)
  
  // If we have exactly 6 courses, make the last one backup
  if (coursesToKeep.length === 6) {
    const lastCourse = coursesToKeep[coursesToKeep.length - 1]
    backupCourseIds.value.add(lastCourse.code)
  }
  
  // If we have 5 courses, suggest selecting 1 more as backup
  if (coursesToKeep.length === 5) {
    alert('You have 5 courses selected. Consider adding 1 more as a backup course.')
  }
  
  saveCourseStatuses()
}

// Clear all selections
const clearAllSelections = () => {
  if (confirm('Are you sure you want to clear all course selections?')) {
    // Unselect all courses through the store
    selectedCourses.value.forEach(course => {
      store.toggleCourse(course)
    })
    backupCourseIds.value.clear()
    saveCourseStatuses()
  }
}

// Save course statuses to localStorage
const saveCourseStatuses = () => {
  try {
    localStorage.setItem('backupCourseIds', JSON.stringify([...backupCourseIds.value]))
  } catch (error) {
    console.error('Failed to save course statuses:', error)
  }
}

// Load course statuses from localStorage
const loadCourseStatuses = () => {
  try {
    const saved = localStorage.getItem('backupCourseIds')
    if (saved) {
      const backupIds = JSON.parse(saved)
      backupCourseIds.value = new Set(backupIds)
    }
  } catch (error) {
    console.error('Failed to load course statuses:', error)
  }
}

// Watch for course selection changes to enforce limits
watch(selectedCourses, (newCourses, oldCourses) => {
  const newCount = newCourses.length
  const oldCount = oldCourses ? oldCourses.length : 0
  
  // If adding a course and we're at the limit
  if (newCount > oldCount && newCount > 6) {
    // Find the newly added course and remove it
    const newCourse = newCourses.find(course => 
      !oldCourses?.some(old => old.code === course.code)
    )
    if (newCourse) {
      setTimeout(() => {
        store.toggleCourse(newCourse)
        alert('Cannot select more than 6 courses total (5 primary + 1 backup)')
      }, 100)
    }
  }
  
  // Clean up backup status for unselected courses
  const selectedCodes = new Set(newCourses.map(c => c.code))
  const currentBackups = [...backupCourseIds.value]
  currentBackups.forEach(code => {
    if (!selectedCodes.has(code)) {
      backupCourseIds.value.delete(code)
    }
  })
  
  saveCourseStatuses()
}, { immediate: true })

// Load statuses on component mount
loadCourseStatuses()
</script>

<style scoped>
.credit-limit-warning {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.credit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--nord4);
}

.credit-header h2 {
  color: var(--nord1);
  margin: 0;
  font-size: 1.5rem;
}

.limit-summary {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  min-width: 120px;
  transition: all 0.3s ease;
}

.selected-count {
  font-size: 1.8rem;
  font-weight: bold;
  line-height: 1;
}

.limit-label {
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

/* Status-based styling */
.limit-summary.empty {
  background: var(--nord4);
  color: var(--nord3);
}

.limit-summary.in-progress {
  background: var(--nord13);
  color: var(--nord1);
}

.limit-summary.complete {
  background: var(--nord8);
  color: white;
}

.limit-summary.perfect {
  background: var(--nord14);
  color: white;
}

.limit-summary.exceeded {
  background: var(--nord11);
  color: white;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.progress-container {
  margin: 1.5rem 0;
  width: 100%;
}

.progress-bar {
  height: 12px;
  background-color: var(--nord4);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--nord8) 0%, var(--nord10) 100%);
  transition: width 0.3s ease;
  border-radius: 6px;
}

.progress-label {
  margin: 0;
  font-size: 0.9rem;
  color: var(--nord2);
  text-align: center;
  font-weight: 500;
}

.selection-breakdown {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.primary-courses h3,
.backup-courses h3 {
  color: var(--nord1);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.course-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.course-card {
  padding: 1rem;
  border-radius: 8px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  background: white;
}

.course-card.primary {
  border-color: var(--nord10);
  background: rgba(94, 129, 172, 0.05);
}

.course-card.backup {
  border-color: var(--nord13);
  background: rgba(235, 203, 139, 0.05);
  border-style: dashed;
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.course-code {
  font-weight: bold;
  color: var(--nord1);
}

.backup-badge {
  background: var(--nord13);
  color: var(--nord1);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: bold;
}

.backup-toggle,
.primary-toggle {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.backup-toggle:hover,
.primary-toggle:hover {
  background: var(--nord4);
}

.course-name {
  font-weight: 600;
  color: var(--nord2);
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
  line-height: 1.3;
}

.course-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.85rem;
  color: var(--nord3);
}

.empty-state {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--nord3);
  border: 2px dashed var(--nord4);
  border-radius: 8px;
}

.empty-state.backup {
  border-color: var(--nord13);
  color: var(--nord2);
}

.empty-state small {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.8rem;
  opacity: 0.8;
}

.warning-messages {
  margin-bottom: 2rem;
}

.warning-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  border-radius: 6px;
  font-weight: 500;
}

.warning-item.error {
  background: rgba(191, 97, 106, 0.1);
  color: var(--nord11);
  border-left: 4px solid var(--nord11);
}

.warning-item.warning {
  background: rgba(235, 203, 139, 0.1);
  color: var(--nord1);
  border-left: 4px solid var(--nord13);
}

.warning-item.success {
  background: rgba(163, 190, 140, 0.1);
  color: var(--nord1);
  border-left: 4px solid var(--nord14);
}

.warning-item.info {
  background: rgba(136, 192, 208, 0.1);
  color: var(--nord1);
  border-left: 4px solid var(--nord8);
}

.selection-guidance {
  background: var(--nord6);
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.selection-guidance h3 {
  color: var(--nord1);
  margin-bottom: 1rem;
}

.guidelines-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.guideline-item {
  padding: 0.5rem 0;
  color: var(--nord2);
  line-height: 1.5;
}

.guideline-item strong {
  color: var(--nord1);
}

.quick-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
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

.auto-arrange {
  background: var(--nord8);
  color: white;
}

.auto-arrange:hover:not(:disabled) {
  background: var(--nord7);
  transform: translateY(-2px);
}

.auto-arrange:disabled {
  background: var(--nord4);
  color: var(--nord3);
  cursor: not-allowed;
}

.clear-all {
  background: var(--nord11);
  color: white;
}

.clear-all:hover {
  background: var(--nord12);
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .selection-breakdown {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .credit-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .quick-actions {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
  }
}
</style>
