/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
/// <reference types="@cloudflare/workers-types" />

type KVNamespace = import("@cloudflare/workers-types").KVNamespace;
type ENV = {
    DB: import("@cloudflare/workers-types").D1Database;
    MEDIA: import("@cloudflare/workers-types").R2Bucket;
    CACHE: KVNamespace;
};

type Runtime = import("@astrojs/cloudflare").Runtime<ENV>;

declare namespace App {
    interface Locals extends Runtime {
        user?: {
            id: string;
            email: string;
            role: string;
        }
    }
}