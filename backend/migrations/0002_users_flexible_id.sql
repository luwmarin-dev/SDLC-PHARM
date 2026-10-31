DROP TABLE IF EXISTS "user_settings" CASCADE;
--> statement-breakpoint
DROP TABLE IF EXISTS "users" CASCADE;
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"username" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"display_name" varchar(255) NOT NULL,
	"avatar" text,
	"role" varchar(50) DEFAULT 'member' NOT NULL,
	"bio" text,
	"is_email_verified" boolean DEFAULT false NOT NULL,
	"is_banned" boolean DEFAULT false NOT NULL,
	"verification_code" varchar(10),
	"reset_code" varchar(10),
	"languages" text[] DEFAULT '{"en"}' NOT NULL,
	"interests" text[] DEFAULT '{}' NOT NULL,
	"oblast" varchar(100),
	"raion" varchar(100),
	"village" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"content_languages" text[] DEFAULT '{"ru"}' NOT NULL,
	"email_replies" boolean DEFAULT true NOT NULL,
	"email_sessions" boolean DEFAULT true NOT NULL,
	"email_courses" boolean DEFAULT false NOT NULL,
	"email_newsletter" boolean DEFAULT false NOT NULL,
	"public_profile" boolean DEFAULT true NOT NULL,
	"show_region" boolean DEFAULT true NOT NULL,
	"allow_messages" boolean DEFAULT true NOT NULL,
	CONSTRAINT "user_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
