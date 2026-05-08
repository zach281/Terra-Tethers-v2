-- Allow the handle_new_user() trigger to insert profile rows.
-- Without this, RLS blocks the insert even from a SECURITY DEFINER function
-- in Supabase Cloud where the function owner may not bypass RLS.
CREATE POLICY "Profiles allow insert" ON profiles FOR INSERT WITH CHECK (true);
