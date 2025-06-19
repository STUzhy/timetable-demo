<template>
  <div id="app">
    <main class="app-main">
      <WeeklyCalendar />
    </main>
  </div>
</template>

<script setup>
import WeeklyCalendar from './WeeklyCalendar.vue'
</script>

<style>
#app {
  min-height: 100vh;
  height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  box-sizing: border-box;
  overflow: hidden;
}

.app-main {
  display: flex;
  justify-content: center;
  height: 100%;
  width: 100%;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
</style>