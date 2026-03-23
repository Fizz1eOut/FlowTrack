import { supabase } from './db';

async function createTodayCopy(templateTaskId: string): Promise<void> {
  const today = new Date().toISOString().split('T')[0];

  const { data: existingCopy } = await supabase
    .from('tasks')
    .select('id')
    .eq('original_task_id', templateTaskId)
    .gte('due_date', `${today}T00:00:00.000Z`)
    .lt('due_date', `${today}T23:59:59.999Z`)
    .maybeSingle();

  if (existingCopy) return;

  const { data: template, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', templateTaskId)
    .single();

  if (error || !template) return;

  const { error: insertError } = await supabase
    .from('tasks')
    .insert({
      title: template.title,
      description: template.description,
      user_id: template.user_id,
      workspace_id: template.workspace_id,
      due_date: today,
      due_time: template.due_time,
      priority: template.priority,
      status: 'backlog',
      estimate_minutes: template.estimate_minutes,
      tags: template.tags,
      is_recurring: true,
      original_task_id: templateTaskId,
    });

  if (insertError && insertError.code !== '23505') {
    console.error('[Recurring] Insert error:', insertError);
  }
}

export async function checkAndCreateRecurringCopies(userId: string): Promise<void> {
  const { data: templates, error } = await supabase
    .from('tasks')
    .select('id')
    .eq('user_id', userId)
    .eq('is_recurring', true)
    .is('original_task_id', null);

  if (error || !templates?.length) return;

  await Promise.allSettled(templates.map(t => createTodayCopy(t.id)));
  console.log(`[Recurring] Checked ${templates.length} recurring tasks for user ${userId}`);
}
