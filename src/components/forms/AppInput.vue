<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
    modelValue: [String, Number],
    label: String,
    type: String,
    placeholder: String,
    required: Boolean,
});

const emit = defineEmits(['update:modelValue', 'focus', 'blur']);
const passwordVisible = ref(false);
const isPassword = computed(() => props.type === 'password');
const inputType = computed(() => isPassword.value && passwordVisible.value ? 'text' : props.type);

const value = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
});


</script>

<template>
    <div class="app-input">
        <label v-if="label" class="label-class">
            {{ label }}
            <span v-if="required" class="required">*</span>
        </label>
        <div class="input-wrapper">
        <input
            v-model="value"
            :type="inputType"
            :placeholder="placeholder"
            :required="required"
            class="input-class"
            :class="{ 'input-class--password': isPassword }"
            @focus="$emit('focus')"
            @blur="$emit('blur')"
        >
        <button
            v-if="isPassword"
            type="button"
            class="password-toggle"
            :aria-label="passwordVisible ? 'Ocultar senha' : 'Mostrar senha'"
            :title="passwordVisible ? 'Ocultar senha' : 'Mostrar senha'"
            @click="passwordVisible = !passwordVisible"
        >
            <span :class="passwordVisible ? 'mdi mdi-eye' : 'mdi mdi-eye-off'"> </span>
        </button>
        </div>
    </div>

</template>

<style scoped>
.app-input {
    margin-bottom: 4vw;
}

.label-class {
    display: block;
    margin-bottom: 10px;
    font-weight: 500;
    transition: color .3s ease;
}

.app-input:focus-within .label-class {
    color: var(--primaria, #00265c);
}

.input-class {
    box-sizing: border-box;
    border: 2px solid #D9D9D9;
    background-color: inherit;
    padding: 8px 15px;
    width: 100%;
    border-radius: 5px;
    font-family: 'Poppins';
    transition: border-color .3s ease, box-shadow .3s ease;
}

.input-class:hover {
    border-color: #5b7399;
}

.input-class:focus {
    outline: none;
    border-color: var(--primaria, #00265c);
    box-shadow: 0 0 0 4px rgba(0, 38, 92, 0.12);
}

.password-toggle {
    position: absolute;
    top: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.75rem;
    height: 100%;
    padding: 0;
    border: 0;
    border-radius: 5px;
    background: transparent;
    color: #525252;
    cursor: pointer;
    transition: color .3s ease;
}

.password-toggle:hover {
    color: var(--primaria, #00265c);
}

.password-toggle:focus-visible {
    outline: 2px solid var(--primaria, #00265c);
    outline-offset: -4px;
}

.required {
    color: #FD151B;
}


@media(min-width: 768px) {
    .app-input {
        margin-bottom: 2vw;
    }
}
</style>
