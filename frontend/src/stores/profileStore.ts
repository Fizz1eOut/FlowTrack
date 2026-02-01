import { defineStore } from 'pinia';
import { ref } from 'vue';
import { supabase } from '@/utils/supabase';
import type { UserProfile } from '@/interface/profile.interface';

export const useProfileStore = defineStore('profile', () => {
  const profileCache = ref<Record<string, UserProfile>>({});
  const loading = ref<Record<string, boolean>>({});

  // Получение профиля по ID
  async function loadProfile(userId: string): Promise<UserProfile | null> {
    if (loading.value[userId]) {
      return profileCache.value[userId] || null;
    }

    if (profileCache.value[userId]) {
      return profileCache.value[userId];
    }

    try {
      loading.value[userId] = true;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        profileCache.value[userId] = data;
      }

      return data || null;
    } catch (error) {
      console.error('Error loading profile:', error);
      return null;
    } finally {
      loading.value[userId] = false;
    }
  }

  // Обновление профиля
  async function updateProfile(
    userId: string,
    updates: Partial<Omit<UserProfile, 'id' | 'email'>>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;

      // Обновляем кэш
      if (profileCache.value[userId]) {
        profileCache.value[userId] = {
          ...profileCache.value[userId],
          ...updates
        };
      }

      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  }

  // Обновление аватара
  async function updateAvatar(userId: string, file: File): Promise<string | null> {
    try {
      // 1. Загружаем файл в storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true
        });

      if (uploadError) throw uploadError;

      // 2. Получаем публичный URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const avatarUrl = data.publicUrl;

      // 3. Обновляем профиль
      const success = await updateProfile(userId, { avatar_url: avatarUrl });

      return success ? avatarUrl : null;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return null;
    }
  }

  // Удаление аватара
  async function deleteAvatar(userId: string): Promise<boolean> {
    try {
      const profile = profileCache.value[userId];
      
      if (profile?.avatar_url) {
        // Извлекаем путь к файлу из URL
        const urlParts = profile.avatar_url.split('/');
        const filePath = `avatars/${urlParts[urlParts.length - 1]}`;

        // Удаляем файл из storage
        await supabase.storage.from('avatars').remove([filePath]);
      }

      // Обновляем профиль
      return await updateProfile(userId, { avatar_url: null });
    } catch (error) {
      console.error('Error deleting avatar:', error);
      return false;
    }
  }

  // Изменение пароля
  async function updatePassword(newPassword: string): Promise<boolean> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating password:', error);
      return false;
    }
  }

  // Геттеры
  function getProfile(userId: string): UserProfile | null {
    return profileCache.value[userId] || null;
  }

  function getAvatarUrl(userId: string): string | null {
    return profileCache.value[userId]?.avatar_url || null;
  }

  function getFullName(userId: string): string {
    return profileCache.value[userId]?.full_name || '';
  }

  function getInitials(userId: string): string {
    const fullName = getFullName(userId);
    if (!fullName) return '?';
  
    const names = fullName.trim().split(/\s+/).filter(Boolean);
  
    if (names.length >= 2) {
      const first = names[0]?.[0];
      const second = names[1]?.[0];
      if (first && second) {
        return (first + second).toUpperCase();
      }
    }
  
    if (names.length === 1) {
      const word = names[0] || '';
      const firstChar = word[0];
      const secondChar = word[1];
    
      if (firstChar && secondChar) {
        return (firstChar + secondChar).toUpperCase();
      }
      return firstChar?.toUpperCase() || '?';
    }
  
    return '?';
  }

  function isLoading(userId: string): boolean {
    return loading.value[userId] || false;
  }

  function clearCache(userId: string) {
    delete profileCache.value[userId];
    delete loading.value[userId];
  }

  function clearAllCache() {
    profileCache.value = {};
    loading.value = {};
  }

  return {
    profileCache,
    loading,
    
    loadProfile,
    updateProfile,
    updateAvatar,
    deleteAvatar,
    updatePassword,
    
    getProfile,
    getAvatarUrl,
    getFullName,
    getInitials,
    isLoading,
    
    clearCache,
    clearAllCache
  };
});
