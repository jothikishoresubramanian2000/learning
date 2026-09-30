-- This is an empty migration.

ALTER TABLE "Org" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Org" FORCE ROW LEVEL SECURITY;


CREATE POLICY tenant_isolation on "Org" USING (tenant_id = current_setting('app.tenant_id',true)::text);