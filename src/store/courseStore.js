import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useCourseStore = defineStore('courseStore', () => {
    const selectedCourses = ref(new Set());

    function toggleCourse(code) {
        if (selectedCourses.value.has(code)) {
            selectedCourses.value.delete(code);
        } else {
            selectedCourses.value.add(code);
        }
    }

    function isSelected(code) {
        return selectedCourses.value.has(code);
    }

    return {
        selectedCourses,
        toggleCourse,
        isSelected,
    };
});
