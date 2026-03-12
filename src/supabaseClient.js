import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lcqeztfevcierlmeecjh.supabase.co';
const supabaseKey = 'sb_publishable_7kAmv1fgUDwp3V5HaswXpQ_OXfmUZx8';

export const supabase = createClient(supabaseUrl, supabaseKey);
