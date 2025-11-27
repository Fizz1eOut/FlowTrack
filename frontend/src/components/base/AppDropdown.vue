<script setup lang="ts">
  import AppUnderlay from '@/components/base/AppUnderlay.vue';
  import AppContainer from '@/components/base/AppContainer.vue';

  interface dropdownProps {
    active?: boolean;
  }
  defineProps<dropdownProps>();
</script>

<template>
  <Transition>
    <div v-if="active" class="dropdown">
      <app-underlay>
        <app-container>
          <ul class="dropdown-list">
            <slot ></slot>
          </ul>
        </app-container>
      </app-underlay>
    </div>
  </Transition>
</template>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease-in-out;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
.dropdown {
  position: absolute;
  left: 0px;
  z-index: 10;
  top: 100%;
  border: 1px solid var(--border);
  background-color: var(--surface);
  box-shadow: var(--shadow-md);
  border-radius: var(--space-xs);
  width: 100%;
}
.dropdown-list> *:not(:last-child) {
  margin-bottom: 10px;
}
</style>
