export function endowmentGlobals(id: string, pluginManifest: any, signal: AbortSignal) {
    return {
        console,
        fetch,
        Request,
        Response,
        AbortSignal,
        EventTarget,
        AbortController,
        URL,
        atob,
        btoa,
        TextEncoder,
        TextDecoder,
        crypto,
    }
}
