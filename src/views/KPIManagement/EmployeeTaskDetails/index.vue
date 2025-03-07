<template>
  <div class="title-page mb-4">
    <svg @click="goToRewardMall()" xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-arrow-left-short" viewBox="0 0 16 16">
        <path fill-rule="evenodd" d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5"/>
    </svg>
    <h2>Employee Task Details</h2>
  </div>
</template>


<script lang="ts">

</script>


<style>
.title-page {
    display: flex;
    align-items: center;
    gap: 20px; /* Adjust spacing between the icon and the text */
}

.title-page svg:hover {
  cursor: pointer;
}

.title-page h2 {
    margin-bottom: 0; 
}
</style>