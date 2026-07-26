-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('citoyen', 'agent', 'officier', 'admin');

CREATE TYPE public.document_type AS ENUM (
  'certificat_residence',
  'extrait_naissance',
  'certificat_vie',
  'certificat_celibat',
  'legalisation',
  'attestation_hebergement'
);

CREATE TYPE public.request_status AS ENUM (
  'brouillon',
  'en_attente_paiement',
  'en_attente_guichet',
  'en_verification',
  'en_attente_signature',
  'signe',
  'delivre',
  'rejete'
);

CREATE TYPE public.payment_method AS ENUM ('wave', 'orange_money', 'mtn_money', 'moov_money', 'especes');

-- ============ UPDATED_AT HELPER ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  commune TEXT,
  id_document_number TEXT,
  date_of_birth DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL,
  commune TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('agent', 'officier', 'admin')
  )
$$;

-- ============ DOCUMENT REQUESTS ============
CREATE TABLE public.document_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT NOT NULL UNIQUE,
  verification_code TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  doc_type public.document_type NOT NULL,
  status public.request_status NOT NULL DEFAULT 'brouillon',
  commune TEXT NOT NULL,
  applicant_first_name TEXT NOT NULL,
  applicant_last_name TEXT NOT NULL,
  applicant_birth_date DATE,
  applicant_phone TEXT,
  address_quartier TEXT,
  address_secteur TEXT,
  address_ilot TEXT,
  address_details TEXT,
  is_hosted BOOLEAN NOT NULL DEFAULT false,
  host_full_name TEXT,
  host_id_number TEXT,
  host_signature_data TEXT,
  payment_method public.payment_method,
  payment_amount NUMERIC(10,2),
  payment_reference TEXT,
  paid_at TIMESTAMPTZ,
  ocr_match BOOLEAN,
  ocr_notes TEXT,
  agent_id UUID,
  agent_validated_at TIMESTAMPTZ,
  officer_id UUID,
  signed_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_document_requests_user ON public.document_requests(user_id);
CREATE INDEX idx_document_requests_status ON public.document_requests(status);
CREATE INDEX idx_document_requests_commune ON public.document_requests(commune);

GRANT SELECT, INSERT, UPDATE ON public.document_requests TO authenticated;
GRANT ALL ON public.document_requests TO service_role;
ALTER TABLE public.document_requests ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_document_requests_updated_at
BEFORE UPDATE ON public.document_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ REQUEST DOCUMENTS (pièces jointes) ============
CREATE TABLE public.request_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.document_requests(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  ocr_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_request_documents_request ON public.request_documents(request_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.request_documents TO authenticated;
GRANT ALL ON public.request_documents TO service_role;
ALTER TABLE public.request_documents ENABLE ROW LEVEL SECURITY;

-- ============ POLICIES ============
CREATE POLICY "profiles_select_own" ON public.profiles
FOR SELECT TO authenticated USING (auth.uid() = id OR public.is_staff(auth.uid()));

CREATE POLICY "profiles_insert_own" ON public.profiles
FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "user_roles_select_own" ON public.user_roles
FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "requests_select_own_or_staff" ON public.document_requests
FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_staff(auth.uid()));

CREATE POLICY "requests_insert_own" ON public.document_requests
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "requests_update_own_draft" ON public.document_requests
FOR UPDATE TO authenticated
USING (auth.uid() = user_id AND status IN ('brouillon', 'en_attente_paiement'))
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "requests_update_staff" ON public.document_requests
FOR UPDATE TO authenticated
USING (public.is_staff(auth.uid()))
WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "request_docs_select" ON public.request_documents
FOR SELECT TO authenticated USING (
  public.is_staff(auth.uid())
  OR EXISTS (SELECT 1 FROM public.document_requests r WHERE r.id = request_id AND r.user_id = auth.uid())
);

CREATE POLICY "request_docs_insert_own" ON public.request_documents
FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.document_requests r WHERE r.id = request_id AND r.user_id = auth.uid())
);

CREATE POLICY "request_docs_delete_own" ON public.request_documents
FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.document_requests r
          WHERE r.id = request_id AND r.user_id = auth.uid()
            AND r.status IN ('brouillon', 'en_attente_paiement'))
);

-- ============ VERIFICATION PUBLIQUE (sans compte) ============
CREATE OR REPLACE FUNCTION public.verify_document(_code TEXT)
RETURNS TABLE (
  reference TEXT,
  doc_type public.document_type,
  commune TEXT,
  signed_at TIMESTAMPTZ,
  holder_name TEXT,
  is_valid BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.reference,
         r.doc_type,
         r.commune,
         r.signed_at,
         r.applicant_last_name || ' ' || left(r.applicant_first_name, 1) || '.' AS holder_name,
         (r.status IN ('signe', 'delivre')) AS is_valid
  FROM public.document_requests r
  WHERE upper(r.verification_code) = upper(_code)
    AND r.status IN ('signe', 'delivre')
$$;

GRANT EXECUTE ON FUNCTION public.verify_document(TEXT) TO anon, authenticated;

-- ============ TRIGGER NOUVEL UTILISATEUR ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, phone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.raw_user_meta_data ->> 'phone'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'citoyen')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();