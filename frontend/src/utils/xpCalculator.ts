import type { TaskPriority } from '@/interface/task.interface';

export class XPCalculator {
  private static readonly BASE_XP = 10;

  private static readonly PRIORITY_MULTIPLIERS: Record<TaskPriority, number> = {
    low: 1.0,
    medium: 1.5,
    high: 2.0,
    critical: 3.0 
  };

  private static readonly SUBTASK_BONUS = 5;

  static calculateTaskXP(
    priority: TaskPriority,
    completedSubtasks: number = 0
  ): number {
    const baseXP = this.BASE_XP;
    const priorityMultiplier = this.PRIORITY_MULTIPLIERS[priority] || 1.0;
    const priorityXP = baseXP * priorityMultiplier;
    const subtaskXP = completedSubtasks * this.SUBTASK_BONUS;

    return Math.floor(priorityXP + subtaskXP);
  }

  static getXPBreakdown(
    priority: TaskPriority,
    completedSubtasks: number = 0
  ): {
    baseXP: number;
    priorityBonus: number;
    subtaskBonus: number;
    totalXP: number;
  } {
    const baseXP = this.BASE_XP;
    const priorityMultiplier = this.PRIORITY_MULTIPLIERS[priority] || 1.0;
    const priorityXP = baseXP * priorityMultiplier;
    const subtaskXP = completedSubtasks * this.SUBTASK_BONUS;

    return {
      baseXP: this.BASE_XP,
      priorityBonus: Math.floor(priorityXP - baseXP),
      subtaskBonus: subtaskXP,
      totalXP: Math.floor(priorityXP + subtaskXP)
    };
  }

  static calculateLevel(
    totalXP: number,
    levelRequirements: Array<{ level: number; xp_total: number }>
  ): number {
    if (!levelRequirements || levelRequirements.length === 0) {
      console.warn('Level requirements are missing or empty');
      return 1;
    }

    for (let i = levelRequirements.length - 1; i >= 0; i--) {
      const req = levelRequirements[i];
      if (!req) continue;

      if (totalXP >= req.xp_total) {
        return req.level;
      }
    }

    return 1;
  }


  static getProgressToNextLevel(
    currentXP: number,
    currentLevel: number,
    levelRequirements: Array<{ level: number; xp_required: number; xp_total: number }>
  ): {
    currentLevelXP: number;
    nextLevelXP: number;
    progressXP: number;
    progressPercentage: number;
  } {
    const currentLevelData = levelRequirements.find(lr => lr.level === currentLevel);
    const nextLevelData = levelRequirements.find(lr => lr.level === currentLevel + 1);

    if (!currentLevelData || !nextLevelData) {
      return {
        currentLevelXP: 0,
        nextLevelXP: 0,
        progressXP: 0,
        progressPercentage: 100
      };
    }

    const progressXP = currentXP - currentLevelData.xp_total;
    const xpNeeded = nextLevelData.xp_required;
    const progressPercentage = Math.min(100, Math.floor((progressXP / xpNeeded) * 100));

    return {
      currentLevelXP: currentLevelData.xp_total,
      nextLevelXP: nextLevelData.xp_total,
      progressXP,
      progressPercentage
    };
  }
}
