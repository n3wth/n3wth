CREATE TABLE public.examples (
    id uuid NOT NULL,
    occurred_at timestamp with time zone NOT NULL,
    recorded_at timestamp without time zone NOT NULL,
    payload jsonb,
    labels text[],
    total bigint NOT NULL,
    count integer,
    enabled boolean NOT NULL,
    note text,
    CONSTRAINT examples_pkey PRIMARY KEY (id),
    CONSTRAINT examples_note_count_key UNIQUE (note, count)
);

CREATE TABLE public.empty_records (
    id integer NOT NULL,
    label character varying(100) NOT NULL,
    CONSTRAINT empty_records_pkey PRIMARY KEY (id)
);

CREATE TABLE public.unique_records (
    id integer NOT NULL,
    code character varying(20) NOT NULL,
    CONSTRAINT unique_records_pkey PRIMARY KEY (id),
    CONSTRAINT unique_records_code_key UNIQUE (code)
);
