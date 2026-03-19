import { supabase } from '@/utils/supabase';

export async function linkTelegramAccount(userId: string, telegramId: number): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ telegram_id: telegramId })
    .eq('id', userId);

  if (error) console.error('Failed to link Telegram:', error);
}
