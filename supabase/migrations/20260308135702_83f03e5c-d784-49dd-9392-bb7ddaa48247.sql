
-- Tighten delete: only note owner or notes without owner
DROP POLICY "Anyone can delete notes" ON public.notes;
CREATE POLICY "Owner or anonymous can delete notes" ON public.notes
  FOR DELETE USING (user_id IS NULL OR auth.uid() = user_id);

-- Tighten insert: set user_id if logged in
DROP POLICY "Anyone can create notes" ON public.notes;
CREATE POLICY "Anyone can create notes" ON public.notes
  FOR INSERT WITH CHECK (user_id IS NULL OR auth.uid() = user_id);
