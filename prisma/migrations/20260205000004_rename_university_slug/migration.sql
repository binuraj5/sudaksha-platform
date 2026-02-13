-- Rename State University slug from state-u to university-edu for consistency with URL example
-- Only update if state-u exists and university-edu does not (avoid duplicate key)
UPDATE "Tenant" SET slug = 'university-edu'
WHERE slug = 'state-u'
AND NOT EXISTS (SELECT 1 FROM "Tenant" t2 WHERE t2.slug = 'university-edu');
