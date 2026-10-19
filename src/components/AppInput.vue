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
            :aria-controls="inputId"
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

.label-class{
    display: block;
    margin-bottom: 10px;
    font-weight: 500;
}

.input-class {
    box-sizing: border-box;
    border: 2px solid #D9D9D9;
    background-color: inherit;
    padding: 8px 15px;
    width: 100%;
    border-radius: 5px;
    font-family: 'Poppins';
    transition: all .3s;
}

.input-class:focus {
    outline: none;
    border: 2px solid #171717 ;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.input-wrapper {
    position: relative;
}

.input-class--password {
    padding-right: 3rem;
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
}

.password-toggle:hover {
    color: #171717;
}

.password-toggle:focus-visible {
    outline: 2px solid #171717;
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
