CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: component_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.component_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    category text NOT NULL,
    preview_html text NOT NULL,
    preview_css text,
    state_json jsonb NOT NULL,
    icon text,
    tags text[] DEFAULT '{}'::text[],
    is_builtin boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: style_presets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.style_presets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    category text DEFAULT 'custom'::text NOT NULL,
    state_json jsonb NOT NULL,
    is_public boolean DEFAULT false NOT NULL,
    tags text[] DEFAULT '{}'::text[],
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: component_templates component_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.component_templates
    ADD CONSTRAINT component_templates_pkey PRIMARY KEY (id);


--
-- Name: style_presets style_presets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.style_presets
    ADD CONSTRAINT style_presets_pkey PRIMARY KEY (id);


--
-- Name: style_presets update_style_presets_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_style_presets_updated_at BEFORE UPDATE ON public.style_presets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: style_presets Anyone can create presets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can create presets" ON public.style_presets FOR INSERT WITH CHECK (true);


--
-- Name: component_templates Anyone can create templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can create templates" ON public.component_templates FOR INSERT WITH CHECK (true);


--
-- Name: style_presets Anyone can delete presets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can delete presets" ON public.style_presets FOR DELETE USING (true);


--
-- Name: style_presets Anyone can update their presets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can update their presets" ON public.style_presets FOR UPDATE USING (true);


--
-- Name: style_presets Anyone can view public presets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view public presets" ON public.style_presets FOR SELECT USING ((is_public = true));


--
-- Name: component_templates Anyone can view templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view templates" ON public.component_templates FOR SELECT USING (true);


--
-- Name: component_templates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.component_templates ENABLE ROW LEVEL SECURITY;

--
-- Name: style_presets; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.style_presets ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;