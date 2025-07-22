<template>
    <div id="app">
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
    box-sizing: border-box;
    overflow-x: hidden;
    /* Allow scrolling on all pages */
    overflow-y: auto;
}

* {
    box-sizing: border-box;
}
</style>
