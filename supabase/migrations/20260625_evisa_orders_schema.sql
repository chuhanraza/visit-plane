-- ════════════════════════════════════════════════════════════════════════════
-- VisitPlane e-Visa Order Management — Phase 1 schema
-- Additive: new tables only. Does NOT touch destinations / visa data / SEO / etc.
-- RLS on EVERY table. PII server-side only. Private document storage. Audit trail.
-- See docs/evisa-system-PRD.md + docs/evisa-architecture.md
-- ════════════════════════════════════════════════════════════════════════════

-- ─── Enums (idempotent) ──────────────────────────────────────────────────────
DO $$ BEGIN CREATE TYPE order_status AS ENUM (
  'draft','submitted','awaiting_documents','in_review','processing',
  'approved','rejected','completed','refunded','cancelled'
); EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN CREATE TYPE doc_status AS ENUM ('pending','approved','rejected');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN CREATE TYPE invoice_status AS ENUM ('unpaid','paid','refunded','void');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN CREATE TYPE payment_status AS ENUM ('pending','succeeded','failed','refunded');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN CREATE TYPE payment_provider AS ENUM ('stripe','manual');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN CREATE TYPE discount_type AS ENUM ('percent','fixed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN CREATE TYPE actor_type AS ENUM ('admin','customer','system');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ─── Shared helpers ──────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION evisa_touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

-- Sequences for human-readable refs
CREATE SEQUENCE IF NOT EXISTS evisa_order_ref_seq START 1001;
CREATE SEQUENCE IF NOT EXISTS evisa_invoice_seq   START 1001;

-- ─── profiles + app_admins (role model) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer','admin')),
  full_name   text,
  phone       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app_admins (
  user_id     uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  note        text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- is_admin(): true when the current auth user is in app_admins. SECURITY DEFINER so
-- RLS policies can consult app_admins without recursive RLS issues.
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM app_admins WHERE user_id = auth.uid());
$$;

-- ─── services (visa products) ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                 text UNIQUE NOT NULL,
  country_iso          char(2) NOT NULL,
  country_name         text NOT NULL,
  visa_type            text NOT NULL,
  description          text,
  govt_fee             numeric(10,2) NOT NULL DEFAULT 0 CHECK (govt_fee >= 0),
  service_fee          numeric(10,2) NOT NULL DEFAULT 0 CHECK (service_fee >= 0),
  currency             char(3) NOT NULL DEFAULT 'USD',
  processing_days_min  int NOT NULL DEFAULT 1,
  processing_days_max  int NOT NULL DEFAULT 30,
  required_documents   jsonb NOT NULL DEFAULT '[]'::jsonb,  -- [{key,label,required}]
  active               boolean NOT NULL DEFAULT true,
  is_test              boolean NOT NULL DEFAULT false,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

-- ─── customers ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,  -- null = guest
  email       text NOT NULL,
  full_name   text,
  phone       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(lower(email));

-- ─── promo_codes ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS promo_codes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code            text UNIQUE NOT NULL,
  description     text,
  discount_type   discount_type NOT NULL DEFAULT 'percent',
  discount_value  numeric(10,2) NOT NULL CHECK (discount_value >= 0),
  currency        char(3) NOT NULL DEFAULT 'USD',
  max_redemptions int,
  times_redeemed  int NOT NULL DEFAULT 0,
  active          boolean NOT NULL DEFAULT true,
  valid_from      timestamptz,
  valid_until     timestamptz,
  is_test         boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ─── orders ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_ref        text UNIQUE NOT NULL
                     DEFAULT ('VP-' || to_char(now(),'YYYY') || '-' ||
                              lpad(nextval('evisa_order_ref_seq')::text, 6, '0')),
  customer_id      uuid NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  status           order_status NOT NULL DEFAULT 'draft',
  currency         char(3) NOT NULL DEFAULT 'USD',
  subtotal_govt    numeric(10,2) NOT NULL DEFAULT 0,
  subtotal_service numeric(10,2) NOT NULL DEFAULT 0,
  discount_total   numeric(10,2) NOT NULL DEFAULT 0,
  total            numeric(10,2) NOT NULL DEFAULT 0,
  promo_code_id    uuid REFERENCES promo_codes(id) ON DELETE SET NULL,
  contact_email    text NOT NULL,
  internal_notes   text,
  submitted_at     timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status   ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created   ON orders(created_at DESC);

-- ─── order_items (traveller PII) ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id                 uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  service_id               uuid NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  service_snapshot         jsonb NOT NULL DEFAULT '{}'::jsonb,  -- service at order time
  traveler_full_name       text NOT NULL,
  traveler_passport_number text NOT NULL,        -- PII
  traveler_dob             date,
  traveler_nationality     text,
  traveler_passport_expiry date,
  govt_fee                 numeric(10,2) NOT NULL DEFAULT 0,
  service_fee              numeric(10,2) NOT NULL DEFAULT 0,
  line_total               numeric(10,2) NOT NULL DEFAULT 0,
  created_at               timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- ─── order_documents (private storage) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_documents (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id       uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  order_item_id  uuid REFERENCES order_items(id) ON DELETE SET NULL,
  doc_type       text NOT NULL,
  file_name      text NOT NULL,
  storage_path   text NOT NULL,            -- path in private 'order-documents' bucket
  file_size      bigint,
  mime_type      text,
  status         doc_status NOT NULL DEFAULT 'pending',
  uploaded_by    text,                     -- 'customer:<id>' / 'admin'
  reviewed_by    text,
  reviewed_at    timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_order_docs_order ON order_documents(order_id);

-- ─── invoices ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoices (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        uuid UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  invoice_number  text UNIQUE NOT NULL
                    DEFAULT ('INV-' || to_char(now(),'YYYY') || '-' ||
                             lpad(nextval('evisa_invoice_seq')::text, 6, '0')),
  status          invoice_status NOT NULL DEFAULT 'unpaid',
  currency        char(3) NOT NULL DEFAULT 'USD',
  subtotal        numeric(10,2) NOT NULL DEFAULT 0,
  discount        numeric(10,2) NOT NULL DEFAULT 0,
  total           numeric(10,2) NOT NULL DEFAULT 0,
  amount_paid     numeric(10,2) NOT NULL DEFAULT 0,
  issued_at       timestamptz NOT NULL DEFAULT now(),
  due_at          timestamptz,
  paid_at         timestamptz,
  pdf_path        text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_invoices_order  ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- ─── payments (idempotent on provider id) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id          uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  order_id            uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  provider            payment_provider NOT NULL DEFAULT 'manual',
  provider_payment_id text UNIQUE,         -- Stripe id; null for manual. UNIQUE = idempotency
  amount              numeric(10,2) NOT NULL DEFAULT 0,
  currency            char(3) NOT NULL DEFAULT 'USD',
  status              payment_status NOT NULL DEFAULT 'pending',
  method              text,
  raw                 jsonb,
  created_at          timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);

-- ─── order_status_history (append-only) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_status_history (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  from_status order_status,
  to_status   order_status NOT NULL,
  changed_by  text NOT NULL DEFAULT 'system',
  note        text,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_status_hist_order ON order_status_history(order_id, created_at);

-- ─── audit_log (append-only, every sensitive change) ─────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor       text NOT NULL DEFAULT 'system',
  actor_type  actor_type NOT NULL DEFAULT 'system',
  action      text NOT NULL,
  entity_type text,
  entity_id   text,
  metadata    jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip          text,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_entity  ON audit_log(entity_type, entity_id);

-- ─── updated_at triggers ─────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_profiles_touch  ON profiles;
CREATE TRIGGER trg_profiles_touch  BEFORE UPDATE ON profiles  FOR EACH ROW EXECUTE FUNCTION evisa_touch_updated_at();
DROP TRIGGER IF EXISTS trg_services_touch  ON services;
CREATE TRIGGER trg_services_touch  BEFORE UPDATE ON services  FOR EACH ROW EXECUTE FUNCTION evisa_touch_updated_at();
DROP TRIGGER IF EXISTS trg_customers_touch ON customers;
CREATE TRIGGER trg_customers_touch BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION evisa_touch_updated_at();
DROP TRIGGER IF EXISTS trg_orders_touch    ON orders;
CREATE TRIGGER trg_orders_touch    BEFORE UPDATE ON orders    FOR EACH ROW EXECUTE FUNCTION evisa_touch_updated_at();
DROP TRIGGER IF EXISTS trg_invoices_touch  ON invoices;
CREATE TRIGGER trg_invoices_touch  BEFORE UPDATE ON invoices  FOR EACH ROW EXECUTE FUNCTION evisa_touch_updated_at();

-- ─── Order status-transition enforcement (DB backstop) ───────────────────────
-- App layer also validates (lib/orders/lifecycle.ts); this trigger makes an illegal
-- transition impossible even via direct SQL / service-role bugs.
CREATE OR REPLACE FUNCTION evisa_enforce_order_transition()
RETURNS TRIGGER AS $$
DECLARE allowed text[];
BEGIN
  IF NEW.status = OLD.status THEN RETURN NEW; END IF;
  allowed := CASE OLD.status
    WHEN 'draft'              THEN ARRAY['submitted','cancelled']
    WHEN 'submitted'          THEN ARRAY['awaiting_documents','in_review','cancelled']
    WHEN 'awaiting_documents' THEN ARRAY['in_review','cancelled']
    WHEN 'in_review'          THEN ARRAY['processing','awaiting_documents','rejected','cancelled']
    WHEN 'processing'         THEN ARRAY['approved','rejected','awaiting_documents','cancelled']
    WHEN 'approved'           THEN ARRAY['completed','refunded']
    WHEN 'rejected'           THEN ARRAY['in_review','refunded','cancelled']
    WHEN 'completed'          THEN ARRAY['refunded']
    ELSE ARRAY[]::text[]  -- refunded, cancelled are terminal
  END;
  IF NOT (NEW.status::text = ANY(allowed)) THEN
    RAISE EXCEPTION 'Illegal order status transition: % -> %', OLD.status, NEW.status
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_orders_transition ON orders;
CREATE TRIGGER trg_orders_transition BEFORE UPDATE OF status ON orders
  FOR EACH ROW EXECUTE FUNCTION evisa_enforce_order_transition();

-- ════════════════════════════════════════════════════════════════════════════
-- RLS — enabled on EVERY table
-- ════════════════════════════════════════════════════════════════════════════
ALTER TABLE profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_admins           ENABLE ROW LEVEL SECURITY;
ALTER TABLE services             ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers            ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders               ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items          ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_documents      ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices             ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments             ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log            ENABLE ROW LEVEL SECURITY;

-- profiles: own row R/W; admin all
DROP POLICY IF EXISTS p_profiles_self ON profiles;
CREATE POLICY p_profiles_self ON profiles FOR ALL TO authenticated
  USING (id = auth.uid() OR is_admin()) WITH CHECK (id = auth.uid() OR is_admin());

-- app_admins: only admins can see; service_role manages
DROP POLICY IF EXISTS p_app_admins_admin ON app_admins;
CREATE POLICY p_app_admins_admin ON app_admins FOR SELECT TO authenticated USING (is_admin());

-- services: public can read ACTIVE; admin full
DROP POLICY IF EXISTS p_services_public_read ON services;
CREATE POLICY p_services_public_read ON services FOR SELECT TO anon, authenticated
  USING (active = true OR is_admin());
DROP POLICY IF EXISTS p_services_admin_write ON services;
CREATE POLICY p_services_admin_write ON services FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- customers: own row R/W; admin all
DROP POLICY IF EXISTS p_customers_own ON customers;
CREATE POLICY p_customers_own ON customers FOR ALL TO authenticated
  USING (user_id = auth.uid() OR is_admin())
  WITH CHECK (user_id = auth.uid() OR is_admin());

-- promo_codes: admin only (validation otherwise via service-role API)
DROP POLICY IF EXISTS p_promos_admin ON promo_codes;
CREATE POLICY p_promos_admin ON promo_codes FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- helper predicate for "current user owns this order"
-- orders: own (via customer) read/insert; admin all
DROP POLICY IF EXISTS p_orders_select ON orders;
CREATE POLICY p_orders_select ON orders FOR SELECT TO authenticated
  USING (is_admin() OR customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS p_orders_insert ON orders;
CREATE POLICY p_orders_insert ON orders FOR INSERT TO authenticated
  WITH CHECK (is_admin() OR customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS p_orders_update ON orders;
CREATE POLICY p_orders_update ON orders FOR UPDATE TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- child tables: visible/insertable if parent order is owned; admin all
DROP POLICY IF EXISTS p_items_select ON order_items;
CREATE POLICY p_items_select ON order_items FOR SELECT TO authenticated
  USING (is_admin() OR order_id IN (
    SELECT o.id FROM orders o JOIN customers c ON c.id=o.customer_id WHERE c.user_id = auth.uid()));
DROP POLICY IF EXISTS p_items_insert ON order_items;
CREATE POLICY p_items_insert ON order_items FOR INSERT TO authenticated
  WITH CHECK (is_admin() OR order_id IN (
    SELECT o.id FROM orders o JOIN customers c ON c.id=o.customer_id WHERE c.user_id = auth.uid()));

DROP POLICY IF EXISTS p_docs_select ON order_documents;
CREATE POLICY p_docs_select ON order_documents FOR SELECT TO authenticated
  USING (is_admin() OR order_id IN (
    SELECT o.id FROM orders o JOIN customers c ON c.id=o.customer_id WHERE c.user_id = auth.uid()));
DROP POLICY IF EXISTS p_docs_insert ON order_documents;
CREATE POLICY p_docs_insert ON order_documents FOR INSERT TO authenticated
  WITH CHECK (is_admin() OR order_id IN (
    SELECT o.id FROM orders o JOIN customers c ON c.id=o.customer_id WHERE c.user_id = auth.uid()));

DROP POLICY IF EXISTS p_invoices_select ON invoices;
CREATE POLICY p_invoices_select ON invoices FOR SELECT TO authenticated
  USING (is_admin() OR order_id IN (
    SELECT o.id FROM orders o JOIN customers c ON c.id=o.customer_id WHERE c.user_id = auth.uid()));

DROP POLICY IF EXISTS p_payments_select ON payments;
CREATE POLICY p_payments_select ON payments FOR SELECT TO authenticated
  USING (is_admin() OR order_id IN (
    SELECT o.id FROM orders o JOIN customers c ON c.id=o.customer_id WHERE c.user_id = auth.uid()));

DROP POLICY IF EXISTS p_hist_select ON order_status_history;
CREATE POLICY p_hist_select ON order_status_history FOR SELECT TO authenticated
  USING (is_admin() OR order_id IN (
    SELECT o.id FROM orders o JOIN customers c ON c.id=o.customer_id WHERE c.user_id = auth.uid()));

-- audit_log: admins read only; writes via service_role (which bypasses RLS)
DROP POLICY IF EXISTS p_audit_admin_read ON audit_log;
CREATE POLICY p_audit_admin_read ON audit_log FOR SELECT TO authenticated USING (is_admin());

-- NOTE: service_role bypasses RLS entirely (used by all server-side privileged ops).
-- No anon policies on PII tables => the browser anon client can never read others' data.

COMMENT ON TABLE orders IS 'e-Visa orders. PII in order_items. RLS-scoped; admin via is_admin().';
