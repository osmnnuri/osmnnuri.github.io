-- Yalnızca yöneticinin kullandığı tablolar anonim ziyaretçiye hiç görünmesin (RLS zaten veriyi engelliyor)
revoke all on public.admins from anon, authenticated;
revoke all on public.interests, public.news_sources, public.news_items, public.news_feed from anon;
-- Puanlama fonksiyonları doğrudan çağrılmasın
revoke execute on function public.score_text(text, text) from public, anon;
revoke execute on function public.news_items_score() from public, anon, authenticated;
