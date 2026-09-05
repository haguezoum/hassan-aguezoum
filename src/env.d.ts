/// <reference types="astro/client" />

import type posthog from "posthog-js";

declare global {
  interface Window {
    posthog?: typeof posthog;
  }
}
