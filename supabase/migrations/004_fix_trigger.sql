-- Wrap the profile INSERT in an exception handler so a trigger failure
-- never blocks auth.users insertion. Profile is created via API if needed.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INTEGER := 0;
BEGIN
  base_username := LOWER(SPLIT_PART(NEW.email, '@', 1));
  base_username := REGEXP_REPLACE(base_username, '[^a-z0-9]', '', 'g');
  IF LENGTH(base_username) < 3 THEN
    base_username := 'trader' || base_username;
  END IF;
  final_username := base_username;
  WHILE EXISTS (SELECT 1 FROM profiles WHERE username = final_username) LOOP
    counter := counter + 1;
    final_username := base_username || counter::TEXT;
  END LOOP;
  INSERT INTO profiles (id, username, display_name)
  VALUES (NEW.id, final_username, COALESCE(NEW.raw_user_meta_data->>'full_name', final_username));
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
