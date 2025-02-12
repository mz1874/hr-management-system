<template>
  <div class="title-page">
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-arrow-left-short" viewBox="0 0 16 16">
        <path fill-rule="evenodd" d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5"/>
    </svg>
    <h2>Point Details</h2>
  </div>

</template>


<script setup lang="ts">


</script>


<style scoped>
.title-page {
    display: flex;
    align-items: center;
    gap: 20px; /* Adjust spacing between the icon and the text */
}

.title-page h2 {
    margin-bottom: 0; 
}

.search-container {
    margin-bottom: 1rem;
}

.filter-container {
    margin-bottom: 2rem;
}

.table-card {
    border: 1px solid #707070;
    padding: 2rem;
    margin-bottom: 1rem;
    border-radius: 20px;
}

.table th,
.table td {
  padding: 1rem;
  vertical-align: middle;
  border-bottom: 1px solid #707070;
}

.btn-primary {
    border: none;
    background-color: #4EA5EF;
    color: white;
}
.btn-primary:hover {
    background-color: #3d95e2;
    color: white;
    border: none;
}

.page-link {
    border: 1px solid #cccccc;
}
.page-item .page-link {
    color: #008080;
}
.page-item.active .page-link {
    color: #fff;
    background-color: #008080;
    border-color: #008080;
}


/* styling for modal */
.modal {
    display: none;
}
.modal-content {
    padding: 15px;
}
.form-label {
    font-weight: bold;
}
.form-control {
    border-color: #000000;
}
</style>
