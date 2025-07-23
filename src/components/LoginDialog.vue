<template>
  <div v-if="showDialog" class="dialog-overlay" @click="closeDialog">
    <div class="login-dialog" @click.stop>
      <div class="dialog-header">
        <h2>Student Login</h2>
        <p>Please enter your credentials to access the pre-enrollment system</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="studentName">Student Name:</label>
          <input 
            type="text" 
            id="studentName"
            v-model="loginForm.name"
            placeholder="Enter your full name"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="studentNumber">Student Number (Password):</label>
          <input 
            type="password" 
            id="studentNumber"
            v-model="loginForm.studentNumber"
            placeholder="Enter your student number"
            required
          />
        </div>
        
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
        
        <div class="form-actions">
          <button type="button" @click="closeDialog" class="btn-cancel">
            Cancel
          </button>
          <button type="submit" class="btn-login" :disabled="!isFormValid">
            Login
          </button>
        </div>
      </form>
      
      <div class="demo-info">
        <h4>Demo Accounts:</h4>
        <div class="demo-accounts">
          <div class="demo-account">
            <strong>Zhang Wei</strong> - 202512345 (Management Information Systems)
          </div>
          <div class="demo-account">
            <strong>Li Ming</strong> - 202512346 (Computer Science)
          </div>
          <div class="demo-account">
            <strong>Wang Hua</strong> - 202512347 (Business Administration)
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { allStudents, setCurrentStudent } from '../data/studentInfo.js'
import { useUserStore } from '../store/userStore.js'

const emit = defineEmits(['login-success', 'close'])
const userStore = useUserStore()

const showDialog = ref(true)
const loginForm = ref({
  name: '',
  studentNumber: ''
})
const errorMessage = ref('')

const isFormValid = computed(() => {
  return loginForm.value.name.trim() && loginForm.value.studentNumber.trim()
})

const handleLogin = () => {
  const student = allStudents.find(s => 
    s.name.toLowerCase() === loginForm.value.name.toLowerCase() && 
    s.studentNumber === loginForm.value.studentNumber
  )
  
  if (student) {
    setCurrentStudent(student)
    userStore.login(student)
    emit('login-success', student)
    closeDialog()
  } else {
    errorMessage.value = 'Invalid credentials. Please check your name and student number.'
  }
}

const closeDialog = () => {
  showDialog.value = false
  emit('close')
}
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.login-dialog {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px var(--shadow);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.dialog-header {
  text-align: center;
  margin-bottom: 2rem;
}

.dialog-header h2 {
  color: var(--text);
  margin: 0 0 0.5rem 0;
  font-size: 1.8rem;
}

.dialog-header p {
  color: var(--text);
  opacity: 0.8;
  margin: 0;
  font-size: 1rem;
}

.login-form {
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text);
  font-weight: 600;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--bg);
  color: var(--text);
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: var(--nord10);
  box-shadow: 0 0 0 3px rgba(94, 129, 172, 0.1);
}

.error-message {
  background: var(--nord11);
  color: white;
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  text-align: center;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-cancel, .btn-login {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel {
  background: var(--border-color);
  color: var(--text);
}

.btn-cancel:hover {
  background: var(--nord3);
  color: white;
}

.btn-login {
  background: var(--nord10);
  color: white;
}

.btn-login:hover:not(:disabled) {
  background: var(--nord9);
  transform: translateY(-2px);
}

.btn-login:disabled {
  background: var(--border-color);
  color: var(--text);
  opacity: 0.5;
  cursor: not-allowed;
}

.demo-info {
  border-top: 1px solid var(--border-color);
  padding-top: 1.5rem;
}

.demo-info h4 {
  color: var(--text);
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
}

.demo-accounts {
  background: var(--bg);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.demo-account {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: var(--text);
  opacity: 0.8;
}

.demo-account:last-child {
  margin-bottom: 0;
}

.demo-account strong {
  color: var(--text);
}

@media (max-width: 480px) {
  .login-dialog {
    padding: 1.5rem;
    margin: 1rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn-cancel, .btn-login {
    width: 100%;
  }
}
</style>
