import { supabase } from "../supabase";

export async function checkAndUpdateDailyLimit() {
  const LIMIT = 2500; // Daily limit
  const now = new Date();

  // 1. Get the row
  const { data, error } = await supabase
    .from('daily_limit')
    .select('count, expire_at')
    .eq('id', 1)
    .single();

  if (error) throw error;

  // 2. Check expiry
  if (!data.expire_at || new Date(data.expire_at) < now) {
    // reset count and expiry
    const expireAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24h from now
    await supabase
      .from('daily_limit')
      .update({ count: 0, expire_at: expireAt.toISOString() })
      .eq('id', 1);
    data.count = 0;
    data.expire_at = expireAt;
  }

  // 3. Check count limit
  if (data.count >= LIMIT) {
    return { allowed: false, retryAfter: Math.ceil((new Date(data.expire_at).getTime() - now.getTime()) / 1000) };
  }

  // 4. Increment count
  await supabase
    .from('daily_limit')
    .update({ count: data.count + 1 })
    .eq('id', 1);

  return { allowed: true };
}
