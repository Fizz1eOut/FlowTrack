<script setup lang="ts">
  import { computed } from 'vue';
  import type { WorkspaceInvitation } from '@/interface/workspace.interface';

  interface invitationCardProps {
    invitation: WorkspaceInvitation;
  }
  const props = defineProps<invitationCardProps>();

  const status = computed(() => {
    if (props.invitation.accepted_at) return 'accepted';
    if (new Date(props.invitation.expires_at) <= new Date()) return 'expired';
    return 'pending';
  });

  const statusLabel = computed(() => {
    return {
      pending: 'Pending',
      expired: 'Expired',
      accepted: 'Accepted'
    }[status.value];
  });
</script>

<template>
  <div class="status" :class="`status--${status}`">
    {{ statusLabel }}
  </div>
</template>

<style scoped>
  .status {
    padding: 4px 10px;
    font-size: var(--fs-xs);
    border-radius: var(--radius-lg);
  }
  .status--pending  {
    background-color: #FEF3E2;
    color: #D97706;
  }
  .status--expired {
    background-color: #FEE2E2;
    color: #DC2626;
  }
  .status--accepted {
    background-color: #D1FAE5;
    color: #059669;
  }
</style>
