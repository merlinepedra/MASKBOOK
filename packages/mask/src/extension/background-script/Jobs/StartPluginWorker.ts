import { startPluginWorker, Plugin } from '@masknet/plugin-infra/background-worker'
import { createWorkerPluginHost } from '@masknet/plugin-infra-external/background-worker'
import { createPluginDatabase } from '../../../../background/database/plugin-db'
import { createPluginHost, createSharedContext } from '../../../plugin-infra/host'
export default function (signal: AbortSignal) {
    startPluginWorker(createPluginHost(signal, createWorkerContext))

    debugger
    createWorkerPluginHost(
        {
            createTaggedStorage: createPluginDatabase,
        },
        signal,
    )
}

function createWorkerContext(pluginID: string, signal: AbortSignal): Plugin.Worker.WorkerContext {
    let storage: Plugin.Worker.DatabaseStorage<any> = undefined!

    return {
        ...createSharedContext(pluginID, signal),
        getDatabaseStorage() {
            return storage || (storage = createPluginDatabase(pluginID, signal))
        },
    }
}
