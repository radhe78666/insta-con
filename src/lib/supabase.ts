import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lcqeztfevcierlmeecjh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjcWV6dGZldmNpZXJsbWVlY2poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMjM0MzEsImV4cCI6MjA4ODc5OTQzMX0.j8YDRU9zl96k4j6Ba_dFgXQoHsMFSud5aaPg9-fMR-M';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
