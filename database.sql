--
-- PostgreSQL database dump
--

\restrict gPftMB8YUriiH821BcsakAWTmrimlN8Mk6CyfO6RJGsqO5M5olEraLTSOkSzxNm

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: dispositivos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dispositivos (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    device_token character varying(100) NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.dispositivos OWNER TO postgres;

--
-- Name: dispositivos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.dispositivos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.dispositivos_id_seq OWNER TO postgres;

--
-- Name: dispositivos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.dispositivos_id_seq OWNED BY public.dispositivos.id;


--
-- Name: lecturas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lecturas (
    id integer NOT NULL,
    temperatura numeric(5,2) NOT NULL,
    humedad numeric(5,2) NOT NULL,
    estado_humedad character varying(20) NOT NULL,
    "timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    usuario_id integer NOT NULL
);


ALTER TABLE public.lecturas OWNER TO postgres;

--
-- Name: lecturas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lecturas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lecturas_id_seq OWNER TO postgres;

--
-- Name: lecturas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lecturas_id_seq OWNED BY public.lecturas.id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    cedula character varying(20) NOT NULL,
    contrasena_hash text NOT NULL,
    nombre character varying(100) NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    rol character varying(20) DEFAULT 'usuario'::character varying
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_seq OWNER TO postgres;

--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: dispositivos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispositivos ALTER COLUMN id SET DEFAULT nextval('public.dispositivos_id_seq'::regclass);


--
-- Name: lecturas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lecturas ALTER COLUMN id SET DEFAULT nextval('public.lecturas_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Name: dispositivos dispositivos_device_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispositivos
    ADD CONSTRAINT dispositivos_device_token_key UNIQUE (device_token);


--
-- Name: dispositivos dispositivos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispositivos
    ADD CONSTRAINT dispositivos_pkey PRIMARY KEY (id);


--
-- Name: lecturas lecturas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lecturas
    ADD CONSTRAINT lecturas_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_cedula_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_cedula_key UNIQUE (cedula);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: idx_lecturas_timestamp; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lecturas_timestamp ON public.lecturas USING btree ("timestamp" DESC);


--
-- Name: dispositivos dispositivos_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispositivos
    ADD CONSTRAINT dispositivos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: lecturas lecturas_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lecturas
    ADD CONSTRAINT lecturas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict gPftMB8YUriiH821BcsakAWTmrimlN8Mk6CyfO6RJGsqO5M5olEraLTSOkSzxNm

