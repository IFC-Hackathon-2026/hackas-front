<script setup>
    // import router from '@/router';

    const emits = defineEmits(['back'])
</script>
<template>

<div class="arrow">
    <span @click="emits('back')" class="mdi mdi-arrow-left"></span>
</div>

</template>

<style scoped >
div.arrow{
    color: var(--principal-claro);
    font-size: 25px;
}

div.arrow span{
    display: inline-block;
    cursor: pointer;
}

div.arrow span:active{
    transform: scale(0.9);
    color: var(--principal-claro);
}
</style>
