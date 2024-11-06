import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hzsqgcrdoajiosoivcwb.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6c3FnY3Jkb2FqaW9zb2l2Y3diIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA5MDMzODEsImV4cCI6MjA0NjQ3OTM4MX0.Y9_R2XLeUpzW4lZhygK9VlRII_zoAdT6zmtm86wlT7E'

export const supabase = createClient(supabaseUrl, supabaseKey)
