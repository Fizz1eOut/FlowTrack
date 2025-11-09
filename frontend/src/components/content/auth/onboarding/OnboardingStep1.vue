<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useAuthStore } from '@/stores/authStore';
  import AppButton from '@/components/base/AppButton.vue';
  import AppContainer from '@/components/base/AppContainer.vue';
  import AppUnderlay from '@/components/base/AppUnderlay.vue';
  import AppRadioButton from '@/components/inputs/AppRadioButton.vue';
  import AppSubtitle from '@/components/base/AppSubtitle.vue';

  const authStore = useAuthStore();
  const workspaceType = ref<'personal' | 'team' | null>(null);
  const loading = ref(false);

  const isValid = computed(() => workspaceType.value !== null);

  const emit = defineEmits<{
    nextStep: [workspaceType: 'personal' | 'team'];
  }>();

  const handleNext = async () => {
    if (!workspaceType.value) {
      console.log('Please select a workspace type');
      return;
    }

    loading.value = true;

    try {
      const result = await authStore.createWorkspace(workspaceType.value);

      if (!result.success) {
        console.log(result.error ?? 'Failed to create workspace');
        return;
      }
      emit('nextStep', workspaceType.value);
    } catch (err) {
      console.log(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      loading.value = false;
    }
  };
</script>

<template>
  <div class="workspace">
    <app-underlay>
      <app-container size="lg">
        <div class="workspace__header">
          <app-subtitle>
            Select the workspace type
          </app-subtitle>
          <p class="workspace__text">This will help us customize FlowTrack to suit your needs.</p>
        </div>
        <div class="workspace__body">
          <div class="workspace__item">
            <app-radio-button
              v-model="workspaceType"
              iconName="user"
              name="workspace"
              value="personal"
              label="Personal workspace"
              description="For individual use and personal projects"

            />
          </div>
          <div class="workspace__item">
            <app-radio-button
              v-model="workspaceType"
              iconName="users"
              name="workspace"
              value="team"
              label="Team workspace"
              description="For collaboration with your team on projects"
            />
          </div>
          <div class="workspace__button">
            <app-button 
              v-if="isValid"
              @click="handleNext" 
              primary
              class="workspace__btn"
            >
              Continue
            </app-button>
          </div>
        </div>
      </app-container>
    </app-underlay>
  </div>
</template>

<style scoped>
  .workspace {
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);  
  } 
  .workspace__item:not(:last-child) {
    margin-bottom: var(--space-xs);
  }
  .workspace__header {
    margin-bottom: var(--space-lg);
  }
  .workspace__text {
    margin-top: var(--space-xs);
    font-size: var(--fs-md);
    color: var(--color-gray);
  }
</style>
