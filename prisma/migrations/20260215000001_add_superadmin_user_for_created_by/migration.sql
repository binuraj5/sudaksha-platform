-- Ensure a User row exists for superadmin so ComponentLibrary.createdBy and similar FKs can reference it.
-- Does not depend on AdminUser table (which may not exist in migration history).
-- Password is a placeholder; sync from AdminUser or reset via app/seed if needed.
INSERT INTO "User" (
    "id",
    "email",
    "password",
    "name",
    "role",
    "isActive",
    "createdAt",
    "updatedAt"
)
SELECT
    'clsuperadmin000000000000001',
    'superadmin@sudaksha.com',
    '$2a$10$placeholder.hash.here',
    'Super Admin',
    'SUPER_ADMIN',
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM "User" u WHERE u."email" = 'superadmin@sudaksha.com');
