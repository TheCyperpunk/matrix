'use client';

// This file is a workaround for the "Multiple matrix-js-sdk entrypoints detected!" error
// that occurs during Next.js Hot Module Replacement (HMR).
// It resets the global flag that the SDK uses to detect multiple instances.

if (typeof globalThis !== 'undefined') {
    // @ts-ignore - accessing internal SDK property
    if (globalThis.__js_sdk_entrypoint) {
        // @ts-ignore
        globalThis.__js_sdk_entrypoint = false;
    }
}

export { };
