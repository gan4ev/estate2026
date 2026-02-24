# Estate 2026 - Website Functionality Overview

The Estate 2026 application is a modern, high-performance web platform built specifically for the real estate industry. It utilizes cutting-edge edge computing technologies to deliver a fast, localized, and secure experience globally.

## Core Architecture

- **Frontend Framework**: The site is built with **Astro**, enabling blazing-fast page loads through static site generation (SSG) combined with dynamic server-side rendering (SSR) where necessary.
- **Hosting Platform**: Deployed on **Cloudflare Pages**, the application runs directly on Cloudflare's global edge network, minimizing latency for users worldwide.
- **Database Backend**: Utilizes **Cloudflare D1**, a serverless SQL database natively integrated into the edge network. This allows for lightning-fast data retrieval for property listings, translations, and user management without the overhead of traditional centralized databases.
- **Media Storage**: Uses **Cloudflare R2**, a distributed object storage mechanism, to cleanly house primary and secondary image assets for real estate listings globally.

## Key Features & Functionality

### 1. Dynamic Multilingual System (i18n)
The website features a fully dynamic, database-driven translation engine that doesn't require rebuilding or redeploying the application to update text.
- **Language Switcher**: Users can instantly toggle the site's language (e.g., English, Bulgarian, Spanish) using the navigation bar.
- **Edge Storage**: All UI text (headlines, buttons, navigation items) is stored natively inside the D1 database (`site_translations` table) for instantaneous retrieval upon request.
- **URL Routing**: The site utilizes localized routing structures (e.g., `/en/contact`, `/bg/properties`) to improve SEO and user navigability natively within Astro.

### 2. Secure Admin Dashboard (`/admin`)
A protected backend portal exists to oversee and manipulate the website's contents dynamically.
- **Edge Authentication Pipeline**: The `/admin` routes are secured by global middleware that automatically detects Cloudflare Zero Trust (Access) sessions or evaluates secure, encrypted HTTP-only browser cookies natively on the Edge. SQLite string case insensitivity and input trimming guarantee robust login integrity.
- **Dynamic Frontend Context**: Based on the evaluation of the login state, the public website automatically conditionally renders tools (e.g., displaying the "Admin Panel" and "Logout" buttons rather than "Sign In").

### 3. CRM & Listings Management
Real estate properties are managed entirely through the interactive UI, tied directly to the edge D1 database tables.
- **Property Visualizer**: Create, read, and manage property cards securely inside the Admin Dashboard.
- **Database Schema**: The structured SQL configuration (`listings`, `listing_i18n`, `media`) ensures relationships are maintained between a listing's location, its multi-language descriptions, and the references to its related R2 images.

### 4. Gemini AI Translation Studio
A custom-built Artificial Intelligence bridge accelerates the administration of languages on the platform via Google's Gemini Flash model.
- **Admin Language Matrix**: The admin panel (`/admin/translations`) provides a visual list of all available languages on the website, tracking modification dates and allowing the creation of entirely new language branches in seconds.
- **AI Magic Generator**: When editing a non-English dictionary, admins can trigger the "✨ Map to Gemini AI Translator." This securely ferries the native English schema through an internal proxy (`/api/admin/gemini.ts`) to the Gemini AI API, returning perfectly structured luxury real-estate jargon in the newly requested language and instantly hydrating the editing layout natively in the browser!
