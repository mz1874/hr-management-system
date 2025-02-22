<template>
    <div class="d-flex mb-4">
        <h2>Report Generation</h2>
    </div>

    <button class="btn btn-primary d-flex mb-4" @click="openFile('Minutes Week 11.pdf')">Generate Report</button>

    <div v-if="filename">
        <p>File Name: <span>{{ filename }}</span></p>
        <iframe :src="filepath" id="myframe"  width="100%" height="600px"></iframe>
    </div>
</template>
  

<script setup lang="ts">
import { ref } from "vue";

const filename = ref("");
const filepath = ref("");

//just showing file
const openFile = (name: string) => {
    filename.value = name;
    filepath.value = `/dist/assets/${name}#toolbar=1`;
};

const generateReport = () => {

}

</script>
    

<style scoped>

</style>
  