-- Community Pulse review pipeline: high-signal scanner/x-poller posts are staged
-- as drafts (review_status='pending') and only appear on the public Pulse once an
-- admin approves them. Existing rows keep review_status NULL and stay visible.
alter table public.sentiment_articles add column if not exists review_status text;
create index if not exists idx_sentiment_review_status
  on public.sentiment_articles (review_status) where review_status is not null;
