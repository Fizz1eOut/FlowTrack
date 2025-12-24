<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import moment from 'moment-timezone';
  import { useAuthStore } from '@/stores/authStore';
  import { useRouter } from 'vue-router';
  import { showToast } from '@/stores/toastStore';
  import AppButton from '@/components/base/AppButton.vue';
  import AppContainer from '@/components/base/AppContainer.vue';
  import AppUnderlay from '@/components/base/AppUnderlay.vue';
  import AppSubtitle from '@/components/base/AppSubtitle.vue';
  import AppInput from '@/components/inputs/AppInput.vue';
  import AppIcon from '@/components/base/AppIcon.vue';
  import AppSelect from '@/components/inputs/AppSelect.vue';

  const router = useRouter();
  const authStore = useAuthStore();
  const workHoursStart = ref<string>('09:00');
  const workHoursEnd = ref<string>('18:00');
  const timezones = ref<string[]>([]);
  const timezone = ref<string>('');
  const loading = ref(false);

  onMounted(() => {
    timezones.value = moment.tz.names();
    timezone.value = Intl.DateTimeFormat().resolvedOptions().timeZone;
  });

  const isValid = computed(() => {
    return workHoursStart.value && workHoursEnd.value && timezone.value;
  });

  const timezoneOptions = computed(() =>
    timezones.value.map((tz) => ({
      id: tz,
      label: `${tz} (UTC${moment().tz(tz).format('Z')})`
    }))
  );

  const handleNext = async () => {
    if (!isValid.value) return;

    loading.value = true;
    const result = await authStore.updateWorkSettings({
      workHoursStart: workHoursStart.value,
      workHoursEnd: workHoursEnd.value,
      timezone: timezone.value,
    });

    loading.value = false;

    if (!result.success) {
      console.error(result.error);
      return;
    }

    router.push('/dashboard/today');
    showToast('Setup is complete! Welcome to FlowTrack.', 'success');
  };
</script>

<template>
  <div class="working-hours">
    <app-underlay>
      <app-container size="lg">
        <div class="working-hours__header">
          <app-subtitle>
            Working hours
          </app-subtitle>
          <p class="working-hours__text">Specify your normal working hours to better plan your tasks.</p>
        </div>
        <div class="working-hours__body">
          <div class="working-hours__items">
            <div class="working-hours__item">
              <div class="working-hours__label">
                <app-icon 
                  name="time"
                  color="var(--color-black)"
                  size="var(--fs-lg)"
                />
                <span>Start of day</span>
              </div>
              <app-input
                v-model="workHoursStart"
                type="time"
                placeholder="Start of day"
                class="working-hours__input"
              />  

            </div>
            <div class="working-hours__item">
              <div class="working-hours__label">
                <app-icon 
                  name="time"
                  color="var(--color-black)"
                  size="var(--fs-lg)"
                />
                <span>End of day</span>
              </div>
              <app-input
                v-model="workHoursEnd"
                type="time"
                placeholder="End of day"
                class="working-hours__input"
              />
            </div>
          </div>

          <div class="working-hours__timezone">
            <app-select 
              v-model="timezone"
              :options="timezoneOptions"
              value-key="id"
              label-key="label"
            />
          </div>

          <div class="working-hours__button">
            <app-button primary :disabled="!isValid" @click="handleNext">
              Continue
            </app-button>
          </div>
        </div>
      </app-container>  
    </app-underlay>
  </div>
</template>

<style scoped>
  .working-hours__header {
    margin-bottom: var(--space-lg);
  }
  .working-hours__text {
    margin-top: var(--space-xs);
    font-size: var(--fs-md);
    color: var(--color-gray);
  }
  .working-hours__body > *:not(:last-child) {
    margin-bottom: var(--space-xs);
  }
  .working-hours__items {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
  }
  .working-hours__item {
    width: 100%;
  }
  .working-hours__label {
    margin-bottom: var(--space-xs);
    font-size: var(--fs-md);
    color: var(--color-black);
    display: flex;
    align-items: center;
    gap: var(--space-xs);
  }
</style>
