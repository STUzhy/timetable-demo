<template>
    <div class="modal-overlay" @click="handleOverlayClick">
        <div class="modal-content" @click.stop>
            <div class="modal-header">
                <h2>Simple Course Entry</h2>
                <button @click="$emit('close')" class="close-btn">×</button>
            </div>
            
            <div class="modal-body">
                <p class="entry-description">
                    Enter 6 courses manually with their weights. This is an accessibility feature for easier course entry.
                </p>
                
                <div class="course-entries">
                    <div 
                        v-for="(course, index) in courseEntries" 
                        :key="index" 
                        class="course-entry"
                    >
                        <div class="entry-header">
                            <span class="entry-number">Course {{ index + 1 }}</span>
                            <span v-if="index === 5" class="backup-label">Backup Course</span>
                        </div>
                        
                        <div class="entry-fields">
                            <div class="field-group">
                                <label>Course Code:</label>
                                <input 
                                    type="text" 
                                    v-model="course.code" 
                                    placeholder="e.g., CS3103"
                                    class="course-code-input"
                                    @input="validateCourseCode(index)"
                                />
                                <div v-if="course.error" class="error-message">{{ course.error }}</div>
                            </div>
                            
                            <div class="field-group">
                                <label>Priority Weight (0-100):</label>
                                <input 
                                    type="number" 
                                    min="0" 
                                    max="100" 
                                    v-model.number="course.weight" 
                                    class="weight-input"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="weight-summary">
                    <div class="total-weight" :class="{ 'valid': isWeightValid, 'invalid': !isWeightValid }">
                        Total Weight: {{ totalWeight }}/100
                    </div>
                    <div v-if="!isWeightValid" class="weight-error">
                        {{ weightErrorMessage }}
                    </div>
                </div>
            </div>
            
            <div class="modal-footer">
                <button @click="$emit('close')" class="cancel-btn">Cancel</button>
                <button 
                    @click="submitCourses" 
                    :disabled="!canSubmit" 
                    class="submit-btn"
                >
                    Add Courses
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { requiredCourses, electiveCourses } from '../data/courses.js'

const emit = defineEmits(['close', 'courses-entered'])

const courseEntries = ref([
    { code: '', weight: 0, error: '' },
    { code: '', weight: 0, error: '' },
    { code: '', weight: 0, error: '' },
    { code: '', weight: 0, error: '' },
    { code: '', weight: 0, error: '' },
    { code: '', weight: 0, error: '' } // Backup course
])

const allCourses = [...requiredCourses, ...electiveCourses]

const totalWeight = computed(() => {
    return courseEntries.value.reduce((sum, course) => sum + (course.weight || 0), 0)
})

const isWeightValid = computed(() => {
    return totalWeight.value === 100
})

const weightErrorMessage = computed(() => {
    if (totalWeight.value < 100) return `Need ${100 - totalWeight.value} more points`
    if (totalWeight.value > 100) return `Exceeded by ${totalWeight.value - 100} points`
    return ''
})

const canSubmit = computed(() => {
    return isWeightValid.value && 
           courseEntries.value.every(course => course.code.trim() !== '' && !course.error)
})

const validateCourseCode = (index) => {
    const courseCode = courseEntries.value[index].code.trim().toUpperCase()
    courseEntries.value[index].code = courseCode
    
    if (!courseCode) {
        courseEntries.value[index].error = ''
        return
    }
    
    // Check if course exists
    const courseExists = allCourses.some(course => course.code === courseCode)
    if (!courseExists) {
        courseEntries.value[index].error = 'Course not found in available courses'
        return
    }
    
    // Check for duplicates
    const duplicateIndex = courseEntries.value.findIndex((course, i) => 
        i !== index && course.code === courseCode
    )
    if (duplicateIndex !== -1) {
        courseEntries.value[index].error = 'Course already entered'
        return
    }
    
    courseEntries.value[index].error = ''
}

const submitCourses = () => {
    const validCourses = courseEntries.value
        .filter(entry => entry.code.trim() !== '')
        .map(entry => ({
            code: entry.code.trim(),
            weight: entry.weight,
            isBackup: courseEntries.value.indexOf(entry) === 5
        }))
    
    emit('courses-entered', validCourses)
    emit('close')
}

const handleOverlayClick = () => {
    emit('close')
}
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background: var(--bg-secondary);
    border-radius: 12px;
    width: 90%;
    max-width: 800px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
    color: var(--text);
    margin: 0;
    font-size: 1.5rem;
}

.close-btn {
    background: none;
    border: none;
    font-size: 2rem;
    cursor: pointer;
    color: var(--text);
    opacity: 0.7;
    transition: opacity 0.2s;
}

.close-btn:hover {
    opacity: 1;
}

.modal-body {
    padding: 2rem;
}

.entry-description {
    color: var(--text);
    margin-bottom: 2rem;
    font-size: 1rem;
    line-height: 1.5;
    text-align: center;
    background: var(--bg);
    padding: 1rem;
    border-radius: 8px;
    border-left: 4px solid var(--nord10);
}

.course-entries {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.course-entry {
    background: var(--bg);
    border-radius: 8px;
    padding: 1.5rem;
    border: 1px solid var(--border-color);
}

.entry-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.entry-number {
    font-weight: bold;
    color: var(--text);
    font-size: 1.1rem;
}

.backup-label {
    background: var(--nord13);
    color: var(--nord0);
    padding: 0.25rem 0.75rem;
    border-radius: 6px;
    font-size: 0.8rem;
    font-weight: bold;
}

.entry-fields {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 1rem;
}

.field-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.field-group label {
    font-weight: 600;
    color: var(--text);
    font-size: 0.9rem;
}

.course-code-input,
.weight-input {
    padding: 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    background: var(--bg-secondary);
    color: var(--text);
    font-size: 1rem;
}

.course-code-input:focus,
.weight-input:focus {
    outline: none;
    border-color: var(--nord10);
    box-shadow: 0 0 0 2px rgba(94, 129, 172, 0.2);
}

.error-message {
    color: var(--nord11);
    font-size: 0.8rem;
    font-weight: 500;
}

.weight-summary {
    text-align: center;
    padding: 1rem;
    background: var(--bg);
    border-radius: 8px;
    border: 1px solid var(--border-color);
}

.total-weight {
    font-size: 1.2rem;
    font-weight: bold;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    display: inline-block;
}

.total-weight.valid {
    background: var(--nord14);
    color: white;
}

.total-weight.invalid {
    background: var(--nord11);
    color: white;
}

.weight-error {
    color: var(--nord11);
    font-size: 0.9rem;
    margin-top: 0.5rem;
    font-weight: 500;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    padding: 1.5rem 2rem;
    border-top: 1px solid var(--border-color);
}

.cancel-btn,
.submit-btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 1rem;
}

.cancel-btn {
    background: var(--border-color);
    color: var(--text);
}

.cancel-btn:hover {
    background: var(--nord3);
    color: white;
}

.submit-btn {
    background: var(--nord10);
    color: white;
}

.submit-btn:hover:not(:disabled) {
    background: var(--nord9);
    transform: translateY(-2px);
}

.submit-btn:disabled {
    background: var(--border-color);
    color: var(--text);
    opacity: 0.5;
    cursor: not-allowed;
}

@media (max-width: 768px) {
    .modal-content {
        width: 95%;
        margin: 1rem;
    }
    
    .entry-fields {
        grid-template-columns: 1fr;
    }
    
    .modal-footer {
        flex-direction: column;
    }
    
    .cancel-btn,
    .submit-btn {
        width: 100%;
    }
}
</style>