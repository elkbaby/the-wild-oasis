//从supabase复制而来
import { createClient } from "@supabase/supabase-js";
export const supabaseUrl = "https://fxbdgtwggbfroxumkekp.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4YmRndHdnZ2Jmcm94dW1rZWtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0NjcyMzIsImV4cCI6MjA4OTA0MzIzMn0.Q19v3Wt2QeiEfwauA0LyrNvZ-3aHwK1YM4saXatksQY";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
