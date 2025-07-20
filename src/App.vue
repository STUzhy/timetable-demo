<template>
    <div id="app">
        <!-- Static layout like header/navbar could go here -->
        <router-view />
    </div>
</template>

<script setup>
    // No component imports here unless used globally
</script>

<style>
body {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

#app {
    min-height: 100vh;
    width: 100vw;
    max-width: 100vw;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
    box-sizing: border-box;
    overflow-x: hidden;
    /* 在planning页面允许滚动，其他页面保持固定高度 */
}

/* 为planning页面特殊处理 */
#app:has(.course-planning) {
    height: auto;
    overflow-y: auto;
}

/* 为其他页面保持全屏布局 */
#app:not(:has(.course-planning)) {
    height: 100vh;
    overflow: hidden;
}

* {
    box-sizing: border-box;
}
</style>
