-- Ensure a User exists for superadmin@sudaksha.com (AdminUser login)
-- ComponentLibrary.createdBy and similar FKs require User.id
-- This allows AdminUser (Super Admin) to save to library without FK violation
INSERT INTO "User" (
    "id",
    "email",
    "password",
    "name",
    "role",
    "userType",
    "isActive",
    "createdAt",
    "updatedAt"
)
SELECT
    'clsuperadmin000000000000001',
    au."email",
    au."passwordHash",
    au."name",
    'SUPER_ADMIN',
    'SUPER_ADMIN',
    true,
    NOW(),
    NOW()
FROM "AdminUser" au
WHERE au."email" = 'superadmin@sudaksha.com'
  AND NOT EXISTS (SELECT 1 FROM "User" u WHERE u."email" = 'superadmin@sudaksha.com');
