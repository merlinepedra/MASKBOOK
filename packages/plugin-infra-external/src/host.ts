import { enumeratePlugins } from './utils/global-store.js'
import { ObservableMap } from '@masknet/shared-base'
import { Result } from 'ts-results'

/** @internal */
export function createPluginHost<HostHook, RunningInstance>(
    startPlugin: (id: string, hostHook: HostHook, signal: AbortSignal) => Promise<RunningInstance>,
) {
    return (hooks: HostHook, signal: AbortSignal) => {
        const plugins = enumeratePlugins()

        const result = new ObservableMap<
            string,
            Result<RunningInstance, unknown> | Promise<Result<RunningInstance, unknown>>
        >()
        for (const plugin of plugins) {
            result.set(
                plugin,
                Result.wrapAsync(() => startPlugin(plugin, hooks, signal)).then((x) => (result.set(plugin, x), x)),
            )
        }
        return result
    }
}
