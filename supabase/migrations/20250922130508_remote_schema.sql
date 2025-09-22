

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


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."set_user_id"() RETURNS "void"
    LANGUAGE "sql"
    AS $$
  select set_config('request.user_id', current_setting('request.headers.x-user-id', true), false);
$$;


ALTER FUNCTION "public"."set_user_id"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."conversations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "title" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."conversations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."daily_limit" (
    "id" integer NOT NULL,
    "count" integer DEFAULT 0 NOT NULL,
    "expire_at" timestamp with time zone
);


ALTER TABLE "public"."daily_limit" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "conversation_id" "uuid",
    "role" "text" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" "text" NOT NULL,
    "password" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "providers" "jsonb" DEFAULT '["credentials"]'::"jsonb" NOT NULL,
    "google_linking" timestamp with time zone
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."daily_limit"
    ADD CONSTRAINT "daily_limit_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE INDEX "conversations_user_id_idx" ON "public"."conversations" USING "btree" ("user_id");



CREATE INDEX "messages_conversation_id_idx" ON "public"."messages" USING "btree" ("conversation_id");



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_user_id_fkey1" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE CASCADE;



CREATE POLICY "Allow insert user with any id" ON "public"."users" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow service role access only" ON "public"."daily_limit" USING (("auth"."role"() = 'service_role'::"text")) WITH CHECK (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "User can access their own conversations" ON "public"."conversations" FOR SELECT USING (("user_id" = (( SELECT "current_setting"('request.user_id'::"text", true) AS "current_setting"))::"uuid"));



CREATE POLICY "User can access their own messages" ON "public"."messages" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."conversations"
  WHERE (("conversations"."id" = "messages"."conversation_id") AND ("conversations"."user_id" = (( SELECT "current_setting"('request.user_id'::"text", true) AS "current_setting"))::"uuid")))));



CREATE POLICY "User can access their own record" ON "public"."users" FOR SELECT USING (("id" = (( SELECT "current_setting"('request.user_id'::"text", true) AS "current_setting"))::"uuid"));



CREATE POLICY "User can delete conversations" ON "public"."conversations" FOR DELETE USING (("user_id" = (( SELECT "current_setting"('request.user_id'::"text", true) AS "current_setting"))::"uuid"));



CREATE POLICY "User can delete their own messages" ON "public"."messages" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."conversations"
  WHERE (("conversations"."id" = "messages"."conversation_id") AND ("conversations"."user_id" = (( SELECT "current_setting"('request.user_id'::"text", true) AS "current_setting"))::"uuid")))));



CREATE POLICY "User can delete their own record" ON "public"."users" FOR DELETE USING (("id" = (( SELECT "current_setting"('request.user_id'::"text", true) AS "current_setting"))::"uuid"));



CREATE POLICY "User can insert conversations" ON "public"."conversations" FOR INSERT WITH CHECK (("user_id" = (( SELECT "current_setting"('request.user_id'::"text", true) AS "current_setting"))::"uuid"));



CREATE POLICY "User can insert messages in their own conversations" ON "public"."messages" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."conversations"
  WHERE (("conversations"."id" = "messages"."conversation_id") AND ("conversations"."user_id" = (( SELECT "current_setting"('request.user_id'::"text", true) AS "current_setting"))::"uuid")))));



CREATE POLICY "User can update their own record" ON "public"."users" FOR UPDATE WITH CHECK (("id" = (( SELECT "current_setting"('request.user_id'::"text", true) AS "current_setting"))::"uuid"));



ALTER TABLE "public"."conversations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."daily_limit" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."set_user_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_user_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_user_id"() TO "service_role";


















GRANT ALL ON TABLE "public"."conversations" TO "anon";
GRANT ALL ON TABLE "public"."conversations" TO "authenticated";
GRANT ALL ON TABLE "public"."conversations" TO "service_role";



GRANT ALL ON TABLE "public"."daily_limit" TO "anon";
GRANT ALL ON TABLE "public"."daily_limit" TO "authenticated";
GRANT ALL ON TABLE "public"."daily_limit" TO "service_role";



GRANT ALL ON TABLE "public"."messages" TO "anon";
GRANT ALL ON TABLE "public"."messages" TO "authenticated";
GRANT ALL ON TABLE "public"."messages" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
