// TODO: move to @masknet/plugin-manifest
export type ValidEntries = 'rpc_generator' | 'rpc' | 'background' | 'content_script' | 'popup' | 'dashboard'
export interface PluginManifest {
    entries?: Partial<Record<ValidEntries, string>>
}
