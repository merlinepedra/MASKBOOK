import type { ModuleDescriptor } from '@masknet/compartment'
import type { PluginManifest } from '../types.js'

export function enumeratePlugins(): readonly string[] {
    if (typeof __mask__register__external__plugins__ === 'undefined') return []
    return __mask__register__external__plugins__
}

export function getPreloadedModule(url: string): ModuleDescriptor | undefined {
    if (typeof __mask__compartment__modules__) return __mask__compartment__modules__.get(url)
    return undefined
}

export function getPluginManifest(id: string): PluginManifest | undefined {
    const desc = getPreloadedModule(`mask://${id}/manifest.json`)
    if (!desc) return
    if (!('namespace' in desc)) return
    // TODO: validate
    return JSON.parse(JSON.stringify(desc.namespace))
}

// global variables
declare const __mask__compartment__modules__: ReadonlyMap<string, ModuleDescriptor>
declare const __mask__register__external__plugins__: undefined | readonly string[]
