--
-- PostgreSQL database dump
--

-- Dumped from database version 12.14
-- Dumped by pg_dump version 12.12 (Ubuntu 12.12-0ubuntu0.20.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


--
-- Name: hstore; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS hstore WITH SCHEMA public;


--
-- Name: EXTENSION hstore; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION hstore IS 'data type for storing sets of (key, value) pairs';


--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: analytics_data; Type: TABLE; Schema: public; Owner: uy02t986ql5od6qu
--

CREATE TABLE public.analytics_data (
    id integer NOT NULL,
    report_name character varying(255),
    report_agency character varying(255),
    date date,
    data jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.analytics_data OWNER TO uy02t986ql5od6qu;

--
-- Name: analytics_data_id_seq; Type: SEQUENCE; Schema: public; Owner: uy02t986ql5od6qu
--

CREATE SEQUENCE public.analytics_data_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.analytics_data_id_seq OWNER TO uy02t986ql5od6qu;

--
-- Name: analytics_data_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: uy02t986ql5od6qu
--

ALTER SEQUENCE public.analytics_data_id_seq OWNED BY public.analytics_data.id;


--
-- Name: knex_migrations; Type: TABLE; Schema: public; Owner: uy02t986ql5od6qu
--

CREATE TABLE public.knex_migrations (
    id integer NOT NULL,
    name character varying(255),
    batch integer,
    migration_time timestamp with time zone
);


ALTER TABLE public.knex_migrations OWNER TO uy02t986ql5od6qu;

--
-- Name: knex_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: uy02t986ql5od6qu
--

CREATE SEQUENCE public.knex_migrations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.knex_migrations_id_seq OWNER TO uy02t986ql5od6qu;

--
-- Name: knex_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: uy02t986ql5od6qu
--

ALTER SEQUENCE public.knex_migrations_id_seq OWNED BY public.knex_migrations.id;


--
-- Name: knex_migrations_lock; Type: TABLE; Schema: public; Owner: uy02t986ql5od6qu
--

CREATE TABLE public.knex_migrations_lock (
    is_locked integer
);


ALTER TABLE public.knex_migrations_lock OWNER TO uy02t986ql5od6qu;

--
-- Name: analytics_data id; Type: DEFAULT; Schema: public; Owner: uy02t986ql5od6qu
--

ALTER TABLE ONLY public.analytics_data ALTER COLUMN id SET DEFAULT nextval('public.analytics_data_id_seq'::regclass);


--
-- Name: knex_migrations id; Type: DEFAULT; Schema: public; Owner: uy02t986ql5od6qu
--

ALTER TABLE ONLY public.knex_migrations ALTER COLUMN id SET DEFAULT nextval('public.knex_migrations_id_seq'::regclass);


--
-- Name: analytics_data analytics_data_pkey; Type: CONSTRAINT; Schema: public; Owner: uy02t986ql5od6qu
--

ALTER TABLE ONLY public.analytics_data
    ADD CONSTRAINT analytics_data_pkey PRIMARY KEY (id);


--
-- Name: knex_migrations knex_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: uy02t986ql5od6qu
--

ALTER TABLE ONLY public.knex_migrations
    ADD CONSTRAINT knex_migrations_pkey PRIMARY KEY (id);


--
-- Name: analytics_data_date_desc_id_asc; Type: INDEX; Schema: public; Owner: uy02t986ql5od6qu
--

CREATE INDEX analytics_data_date_desc_id_asc ON public.analytics_data USING btree (date DESC NULLS LAST, id);


--
-- Name: analytics_data_date_time_desc; Type: INDEX; Schema: public; Owner: uy02t986ql5od6qu
--

CREATE INDEX analytics_data_date_time_desc ON public.analytics_data USING btree (date DESC NULLS LAST);


--
-- Name: analytics_data_report_name_report_agency_index; Type: INDEX; Schema: public; Owner: uy02t986ql5od6qu
--

CREATE INDEX analytics_data_report_name_report_agency_index ON public.analytics_data USING btree (report_name, report_agency);


--
-- PostgreSQL database dump complete
--

