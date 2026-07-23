-- Actualiza el enum Role a los roles multiactor de Huella Viva 360
-- ADMIN_TERRITORIAL | EMPRESA | ESTADO | COMUNIDAD

-- 1. Crear nuevo enum
CREATE TYPE "Role_new" AS ENUM ('ADMIN_TERRITORIAL', 'EMPRESA', 'ESTADO', 'COMUNIDAD');

-- 2. Mapear valores antiguos -> nuevos y cambiar columna
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;

ALTER TABLE "User"
  ALTER COLUMN "role" TYPE "Role_new"
  USING (
    CASE "role"::text
      WHEN 'ADMIN' THEN 'ADMIN_TERRITORIAL'::"Role_new"
      WHEN 'SUPERVISOR' THEN 'ESTADO'::"Role_new"
      WHEN 'OPERARIO' THEN 'COMUNIDAD'::"Role_new"
      ELSE 'COMUNIDAD'::"Role_new"
    END
  );

-- 3. Reemplazar enum antiguo
DROP TYPE "Role";
ALTER TYPE "Role_new" RENAME TO "Role";

-- 4. Nuevo default
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'COMUNIDAD'::"Role";
