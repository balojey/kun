import { createClient } from '@/lib/supabase/server';

export async function checkUserHasGmail(userId: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('connections')
      .select('id')
      .eq('user_id', userId)
      .eq('provider', 'gmail')
      .limit(1);

    if (error) {
      console.error('Error checking Gmail connection:', error);
      return false;
    }

    return data && data.length > 0;
  } catch (error) {
    console.error('Failed to check Gmail connection:', error);
    return false;
  }
}