<script setup lang="ts">
  import { ref } from 'vue';
  import type { WorkspaceMember } from '@/interface/workspace.interface';
  import AppContainer from '@/components/base/AppContainer.vue';
  import AppButton from '@/components/base/AppButton.vue';
  import AppIcon from '@/components/base/AppIcon.vue';
  import WorkspaceMemberRoleBadge from '@/components/content/workspace/team/members/WorkspaceMemberRoleBadge.vue';
  import WorkspaceMemberCardMenu from '@/components/content/workspace/team/members/WorkspaceMemberCardMenu.vue';

  interface WorkspaceMemberCardProps {
    member: WorkspaceMember;
  }
  defineProps<WorkspaceMemberCardProps>();

  const isOpen = ref(false);
</script>

<template>
  <div class="member-card">
    <app-container size="md">
      <div class="member-card__content">
        <div class="member-card__field">
          <div class="member-card__info">
            <div class="member-card__name">
              {{ member.profile?.full_name }}
            </div>
            <div class="member-card__email">
              {{ member.profile?.email }}
            </div>
          </div>
          <div class="member-card__menu" v-if="member.role !== 'owner'">
            <app-button @click="isOpen = !isOpen">
              <app-icon 
                name="three-dots"
                size="var(--fs-xl)"
                color="var(--color-black)"
              />
            </app-button>
            <workspace-member-card-menu :active="isOpen" :member="member" />
          </div>
        </div>

        <div class="member-card__row">
          <workspace-member-role-badge :role="member.role" />
          <div class="member-card__joined">
            Joined: {{ new Date(member.joined_at).toLocaleDateString() }}
          </div>
        </div>
      </div>
    </app-container>
  </div>
</template>

<style scoped>
  .member-card {
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    transition: border 0.3s ease-in-out;
  }
  .member-card:hover {
    border: 1px solid var(--success);
  }
  .member-card__field {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
  }
  .member-card__menu {
    position: relative;
    width: 40px;
    height: 40px;
    transition: background-color 0.3s ease-in-out;
    border-radius: var(--radius-sm);
  }
  .member-card__menu:hover {
    background-color: var(--accent);
  }
  :deep(.dropdown) {
    width: auto;
    right: 0;
    left: unset;
  }
  .member-card__name {
    font-size: var(--space-md);
    font-weight: var(--fw-medium);
    color: var(--color-black);
  }
  .member-card__email {
    margin-top: var(--space-xs);
    font-size: var(--space-md);
    color: var(--color-black);
  }
  .member-card__row {
    margin-top: var(--space-xs);
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .member-card__joined {
    font-size: var(--fs-sm);
    color: var(--color-gray);
  }
</style>
