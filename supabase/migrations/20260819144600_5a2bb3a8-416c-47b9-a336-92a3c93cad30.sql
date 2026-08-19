DELETE FROM public.leads WHERE name = 'Rate Test';
DELETE FROM public.notifications WHERE title = 'New enquiry from Rate Test';
DELETE FROM public.rate_limit_hits;