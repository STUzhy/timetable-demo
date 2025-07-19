<template>
    <div id="app">
        <!-- Static layout like header/navbar could go here -->
        <router-view />
    </div>
</template>

<script setup>
    // No component imports here unless used globally
</script>

<style scoped>
body {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}
#app {
    padding: 0;
    margin: 0;
    max-width: 100%;
}
</style>
