export function getURL(pluginID: string, relativeURL: string) {
    const base = `mask-plugin://${pluginID}/`
    const url = new URL(relativeURL, base).toString()
    if (!url.startsWith(base)) throw new TypeError()
    return url
}
