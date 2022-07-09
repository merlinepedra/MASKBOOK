import type { SyntheticModuleRecord, ModuleDescriptor } from '@masknet/compartment'
import type { PluginManifest } from '../types.js'

export function enumeratePlugins(): readonly string[] {
    if (typeof __mask__compartment__manifests__ === 'undefined') return []
    return Array.from(__mask__compartment__manifests__.keys())
}

export function getPreloadedModule(url: string): ModuleDescriptor | undefined {
    if (typeof __mask__compartment__modules__ === 'object') return { record: __mask__compartment__modules__.get(url)! }
    return undefined
}

export function getPluginManifest(id: string): PluginManifest | undefined {
    const manifest = __mask__compartment__manifests__!.get(id)
    if (!manifest) return
    // TODO: validate
    return JSON.parse(JSON.stringify(manifest))
}

// global variables
declare const __mask__compartment__modules__: undefined | ReadonlyMap<string, SyntheticModuleRecord>
declare const __mask__compartment__manifests__: undefined | ReadonlyMap<string, PluginManifest>
