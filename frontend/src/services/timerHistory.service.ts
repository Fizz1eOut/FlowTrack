import { supabase } from '@/utils/supabase';
import type { TimerHistoryRecord, CreateTimerHistoryInput, TimerHistoryStats } from '@/interface/timerHistory.interface';

export class TimerHistoryService {
  static async create(userId: string, input: CreateTimerHistoryInput): Promise<TimerHistoryRecord> {
    const { data, error } = await supabase
      .from('timer_history')
      .insert({
        user_id: userId,
        ...input
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async fetchAll(userId: string, limit?: number): Promise<TimerHistoryRecord[]> {
    let query = supabase
      .from('timer_history')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data ?? [];
  }

  static async fetchByTask(taskId: string): Promise<TimerHistoryRecord[]> {
    const { data, error } = await supabase
      .from('timer_history')
      .select('*')
      .eq('task_id', taskId)
      .order('started_at', { ascending: false });

    if (error) throw error;
    return data ?? [];
  }

  static async fetchByTaskOrTemplate(taskId: string): Promise<TimerHistoryRecord[]> {
    const { data: task } = await supabase
      .from('tasks')
      .select('original_task_id, is_recurring')
      .eq('id', taskId)
      .single();

    if (!task) return [];

    if (task.original_task_id) {
      const { data, error } = await supabase
        .from('timer_history')
        .select('*')
        .eq('recurring_template_id', task.original_task_id)
        .order('started_at', { ascending: false });

      if (error) throw error;
      return data ?? [];
    }

    if (task.is_recurring) {
      const { data, error } = await supabase
        .from('timer_history')
        .select('*')
        .eq('recurring_template_id', taskId)
        .order('started_at', { ascending: false });

      if (error) throw error;
      return data ?? [];
    }

    const { data, error } = await supabase
      .from('timer_history')
      .select('*')
      .eq('task_id', taskId)
      .is('recurring_template_id', null)
      .order('started_at', { ascending: false });

    if (error) throw error;
    return data ?? [];
  }

  static async fetchByDateRange(
    userId: string, 
    startDate: string, 
    endDate: string
  ): Promise<TimerHistoryRecord[]> {
    const { data, error } = await supabase
      .from('timer_history')
      .select('*')
      .eq('user_id', userId)
      .gte('started_at', startDate)
      .lte('started_at', endDate)
      .order('started_at', { ascending: false });

    if (error) throw error;
    return data ?? [];
  }

  static async getStats(userId: string): Promise<TimerHistoryStats> {
    const { data, error } = await supabase
      .from('timer_history')
      .select('duration_minutes, started_at')
      .eq('user_id', userId);

    if (error) throw error;

    if (!data || data.length === 0) {
      return {
        totalSessions: 0,
        totalMinutes: 0,
        averageSessionMinutes: 0,
        longestSessionMinutes: 0,
        mostProductiveDay: null
      };
    }

    const totalMinutes = data.reduce((sum, record) => sum + record.duration_minutes, 0);
    const longestSession = Math.max(...data.map(r => r.duration_minutes));

    const dayMap = new Map<string, number>();
    data.forEach(record => {
      const day = record.started_at.split('T')[0];
      dayMap.set(day, (dayMap.get(day) || 0) + record.duration_minutes);
    });

    let mostProductiveDay: string | null = null;
    let maxMinutes = 0;
    dayMap.forEach((minutes, day) => {
      if (minutes > maxMinutes) {
        maxMinutes = minutes;
        mostProductiveDay = day;
      }
    });

    return {
      totalSessions: data.length,
      totalMinutes,
      averageSessionMinutes: Math.round(totalMinutes / data.length),
      longestSessionMinutes: longestSession,
      mostProductiveDay
    };
  }

  static async delete(historyId: string): Promise<void> {
    const { error } = await supabase
      .from('timer_history')
      .delete()
      .eq('id', historyId);

    if (error) throw error;
  }

  static async deleteByTask(taskId: string): Promise<void> {
    const { error } = await supabase
      .from('timer_history')
      .delete()
      .eq('task_id', taskId);

    if (error) throw error;
  }
}
