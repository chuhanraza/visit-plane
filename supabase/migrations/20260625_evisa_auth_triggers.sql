-- On new Supabase Auth signup, auto-create the e-visa profile + customer rows.
CREATE OR REPLACE FUNCTION handle_new_evisa_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name')
    ON CONFLICT (id) DO NOTHING;
  INSERT INTO customers (user_id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
    ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_created_evisa ON auth.users;
CREATE TRIGGER on_auth_user_created_evisa
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_evisa_user();
