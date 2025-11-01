
1. Project Overview

Objective: To build a web application for managing the production and distribution lifecycle of cakes.
Primary Actor: A single "Owner" user role.
Technology Stack:
Frontend: React
Styling: Tailwind CSS
Backend: Supabase (PostgreSQL, Auth, Auto-generated APIs)

2. Core Features

Master Data Management: Full CRUD (Create, Read, Update, Delete) functionality for Cakes, Ingredients, and Recipes.
Inventory Control: Manage ingredient stock, including logging new purchases which automatically updates inventory levels.
Production Management:
Initiate production runs based on existing recipes.
Automatically calculate the total production cost.
Atomically update ingredient and final cake stock levels.
Log production date and expiration date.
Distribution Tracking: Record cake shipments to different locations, including quantities of damaged or returned items.
Reporting: Generate key business reports:
Production summaries.
Distribution analysis (by location, damaged goods).
Ingredient usage.
Financial reports (gross/net profit, losses).

3. System Architecture

Model: A React Single-Page Application (SPA) directly interacting with a Supabase Backend-as-a-Service (BaaS). This eliminates the need for a separate, self-hosted server application.
Security: All data is secured at the database level using Supabase's Row Level Security (RLS). Every table contains a user_id column, and policies ensure users can only access their own data.
API Interaction:
CRUD: Simple data operations will use the standard Supabase client library (supabase.from('table').select()).
Complex Logic: Transactional business logic (like processing a production run) will be encapsulated in PostgreSQL functions and called via Remote Procedure Calls (RPC) to ensure data integrity.

4. Database Schema

The database consists of the following core tables, linked by foreign keys to maintain relational integrity.
cakes: Stores cake details, price, and current stock.
ingredients: Stores raw material details, unit, and current stock.
recipes: Defines which ingredients and quantities are needed for a specific cake.
recipe_ingredients: A junction table linking recipes and ingredients.
productions: A log of every production run, including costs and output.
ingredient_purchases: A log of all raw material purchases.
distributions: A master record for each distribution event (date, location).
distribution_items: A detail table linking a distribution event to the specific cakes and quantities shipped.



Structure database that have already on supabase,
Url_project : https://zkjeateandbxizbvpasy.supabase.co
Api supabase : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpramVhdGVhbmRieGl6YnZwYXN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3Mzk2NTAsImV4cCI6MjA3NzMxNTY1MH0.X2NcOqlZXwb2hD-V1RknMf-etzGS1wxhWoB1kU_cTPQ


-- Create tables
CREATE TABLE public.cakes (
id uuid NOT NULL DEFAULT gen_random_uuid(),
user_id uuid NOT NULL,
name text NOT NULL,
price_per_piece integer NOT NULL DEFAULT 0,
current_stock integer NOT NULL DEFAULT 0,
CONSTRAINT cakes_pkey PRIMARY KEY (id),
CONSTRAINT cakes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
CREATE TABLE public.ingredients (
id uuid NOT NULL DEFAULT gen_random_uuid(),
user_id uuid NOT NULL,
name text NOT NULL,
unit text NOT NULL,
current_stock integer NOT NULL DEFAULT 0,
CONSTRAINT ingredients_pkey PRIMARY KEY (id),
CONSTRAINT ingredients_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
CREATE TABLE public.recipes (
id uuid NOT NULL DEFAULT gen_random_uuid(),
user_id uuid NOT NULL,
cake_id uuid NOT NULL,
batch_yield integer NOT NULL,
CONSTRAINT recipes_pkey PRIMARY KEY (id),
CONSTRAINT recipes_cake_id_key UNIQUE (cake_id),
CONSTRAINT recipes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
CONSTRAINT recipes_cake_id_fkey FOREIGN KEY (cake_id) REFERENCES public.cakes(id) ON DELETE CASCADE
);
CREATE TABLE public.recipe_ingredients (
id uuid NOT NULL DEFAULT gen_random_uuid(),
recipe_id uuid NOT NULL,
ingredient_id uuid NOT NULL,
quantity_needed integer NOT NULL,
CONSTRAINT recipe_ingredients_pkey PRIMARY KEY (id),
CONSTRAINT recipe_ingredients_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE CASCADE,
CONSTRAINT recipe_ingredients_ingredient_id_fkey FOREIGN KEY (ingredient_id) REFERENCES public.ingredients(id) ON DELETE RESTRICT
);
CREATE TABLE public.productions (
id uuid NOT NULL DEFAULT gen_random_uuid(),
user_id uuid NOT NULL,
recipe_id uuid NOT NULL,
production_date timestamptz NOT NULL DEFAULT now(),
expired_date timestamptz NOT NULL,
batch_count integer NOT NULL,
total_output integer NOT NULL,
total_cost numeric NOT NULL,
CONSTRAINT productions_pkey PRIMARY KEY (id),
CONSTRAINT productions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
CONSTRAINT productions_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE RESTRICT
);
CREATE TABLE public.ingredient_purchases (
id uuid NOT NULL DEFAULT gen_random_uuid(),
user_id uuid NOT NULL,
ingredient_id uuid NOT NULL,
purchase_date timestamptz NOT NULL DEFAULT now(),
quantity integer NOT NULL,
price_per_unit numeric NOT NULL,
total_cost numeric NOT NULL,
CONSTRAINT ingredient_purchases_pkey PRIMARY KEY (id),
CONSTRAINT ingredient_purchases_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
CONSTRAINT ingredient_purchases_ingredient_id_fkey FOREIGN KEY (ingredient_id) REFERENCES public.ingredients(id) ON DELETE RESTRICT
);
CREATE TABLE public.distributions (
id uuid NOT NULL DEFAULT gen_random_uuid(),
user_id uuid NOT NULL,
distribution_date timestamptz NOT NULL DEFAULT now(),
location text NOT NULL,
CONSTRAINT distributions_pkey PRIMARY KEY (id),
CONSTRAINT distributions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
CREATE TABLE public.distribution_items (
id uuid NOT NULL DEFAULT gen_random_uuid(),
distribution_id uuid NOT NULL,
cake_id uuid NOT NULL,
quantity_distributed integer NOT NULL,
quantity_damaged integer NOT NULL DEFAULT 0,
CONSTRAINT distribution_items_pkey PRIMARY KEY (id),
CONSTRAINT distribution_items_distribution_id_fkey FOREIGN KEY (distribution_id) REFERENCES public.distributions(id) ON DELETE CASCADE,
CONSTRAINT distribution_items_cake_id_fkey FOREIGN KEY (cake_id) REFERENCES public.cakes(id) ON DELETE RESTRICT
);
-- Enable RLS and create policies for the 'cakes' table (repeat for all other tables)
ALTER TABLE public.cakes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner can perform all operations on their own cakes"
ON public.cakes FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
-- Note: Policies similar to the one above must be created for every table to ensure data security.



5. Key Server-Side Logic

The most critical business logic is handled by a single, transactional database function to prevent data inconsistencies.
Function: process_production_run(recipe_id, batch_count)
1. Validate: Checks if there is sufficient stock for all required ingredients. Fails if not.
2. Calculate Cost: Determines the total production cost based on the latest purchase price of ingredients.
3. Update Stock: Atomically decrements ingredient stock and increments the final cake stock.
4. Log: Creates a new record in the productions table.

6. Frontend Structure

Organization: A feature-based directory structure (e.g., /src/features/production, /src/features/cakes).
State Management: A lightweight global state manager like Zustand is recommended.
UI Components: Styling will be handled with Tailwind CSS. A component library like Shadcn/UI or Headless UI is recommended to accelerate development.

6. API Endpoint Specification
This section details the API endpoints provided by Supabase. All endpoints require an Authorization: Bearer <SUPABASE_JWT> header and the apikey header.
6.1. Authentication
POST /auth/v1/token?grant_type=password
Description: User Sign In.
Request Body: { "email": "user@example.com", "password": "securepassword" }
POST /auth/v1/signup
Description: New User Registration.
Request Body: { "email": "user@example.com", "password": "securepassword" }
POST /auth/v1/logout
Description: User Sign Out.
6.2. Cakes (/rest/v1/cakes)
GET /: Retrieves a list of all cakes for the authenticated user.
POST /: Creates a new cake.
Request Body: { "name": "Chocolate Fudge", "price_per_piece": 5000 }
PATCH?id=eq.<cake_id>: Updates an existing cake.
Request Body: { "price_per_piece": 5500 }
DELETE?id=eq.<cake_id>: Deletes a cake.
6.3. Ingredients (/rest/v1/ingredients)
GET /: Retrieves a list of all ingredients.
POST /: Creates a new ingredient.
Request Body: { "name": "Flour", "unit": "gram", "current_stock": 10000 }
PATCH?id=eq.<ingredient_id>: Updates an ingredient.
DELETE?id=eq.<ingredient_id>: Deletes an ingredient.
6.4. Recipes (/rest/v1/recipes)
GET?select=*,recipe_ingredients(*,ingredients(name,unit)): Retrieves all recipes, including their nested ingredients.
POST /: Creates a new recipe. Note: The ingredients must be added separately to the recipe_ingredients table. An RPC function is recommended for a single-transaction creation.
Request Body: { "cake_id": "...", "batch_yield": 20 }
6.5. Business Logic (RPC)
These endpoints execute complex, transactional logic defined in PostgreSQL functions.
POST /rpc/process_production_run
Description: Executes a full production cycle atomically.
Request Body: { "p_recipe_id": "...", "p_batch_count": 5, "p_expired_date": "YYYY-MM-DD" }
Success Response: { "status": "success", "production_id": "...", "total_cost": 150000 }
POST /rpc/log_ingredient_purchase (Recommended function)
Description: Logs a new ingredient purchase and updates stock in one transaction.
Request Body: { "p_ingredient_id": "...", "p_quantity": 5000, "p_price_per_unit": 15 }
POST /rpc/log_distribution (Recommended function)
Description: Creates a distribution record and all its items, while updating cake stock levels atomically.
Request Body: { "p_location": "Main Store", "p_items": [{ "cake_id": "...", "quantity_distributed": 15, "quantity_damaged": 1 }] }
POST /rpc/get_financial_report (Recommended function)
Description: Generates an aggregated financial report for a given date range.
Request Body: { "start_date": "YYYY-MM-DD", "end_date": "YYYY-MM-DD" }

