import { createModuleCache, type Compartment } from '@masknet/compartment'
import { createCompartment } from './compartment.js'
import type { Plugin } from '@masknet/plugin-infra'
import { combineAbortSignal } from '@dimensiondev/kit'
import { peerDeps } from '../modules/peer-deps.js'
import { getPluginManifest } from '../../utils/global-store.js'
import { getURL } from '../../utils/url.js'
import { WebExtensionMessage, MessageTarget } from '@dimensiondev/holoflows-kit'
import { AsyncCall } from 'async-call-rpc/full'
import { serializer } from '@masknet/shared-base'

export interface RunningWorker {
    abort(): void
    signal: AbortSignal
    compartment: Compartment
    hooks: WorkerHooks
}
export interface WorkerHooks {
    backupHandler: Plugin.Worker.BackupHandler | undefined
}
export interface WorkerPluginHostHooks {
    createTaggedStorage(id: string, signal: AbortSignal): Plugin.Worker.DatabaseStorage
}
function createWorkerEnv(id: string, host: WorkerPluginHostHooks, parentSignal: AbortSignal) {
    const abortController = new AbortController()
    const signal = combineAbortSignal(parentSignal, abortController.signal)

    const modules = createModuleCache()
    Object.setPrototypeOf(modules.moduleMap, peerDeps)

    modules.addNamespace('@masknet/plugin/worker', {
        taggedStorage: host.createTaggedStorage(id, signal),
        addBackupHandler: (handler: Plugin.Worker.BackupHandler) => {
            if (hooks.backupHandler) throw new Error('Backup handler already set')
            console.log('[Plugin]', id, 'has registered a backup handler', handler)
            hooks.backupHandler = handler
        },
    })

    const compartment = createCompartment(id, modules.moduleMap, signal)

    const hooks: WorkerHooks = {
        backupHandler: undefined,
    }

    return { compartment, hooks, signal, abort: () => abortController.abort() }
}

export async function startWorkerPlugin(
    id: string,
    host: WorkerPluginHostHooks,
    parentSignal: AbortSignal,
): Promise<RunningWorker> {
    const manifest = getPluginManifest(id)
    if (!manifest) throw new Error(`Plugin ${id} does not have a valid manifest.`)

    const { background, rpc, rpc_generator } = manifest.entries || {}
    const env = createWorkerEnv(id, host, parentSignal)

    // this plugin does not need to be started in the worker.
    if (!background && !rpc && !rpc_generator) return env

    if (background) await env.compartment.import(getURL(id, background))
    const channel = new WebExtensionMessage<{ _: any; $: any }>({ domain: `mask-plugin-${id}-rpc` })
    if (rpc) {
        AsyncCall(env.compartment.import(getURL(id, rpc)), {
            channel: channel.events._.bind(MessageTarget.Broadcast),
            serializer,
            log: true,
            thenable: false,
        })
    }
    if (rpc_generator) {
        AsyncCall(env.compartment.import(getURL(id, rpc_generator)), {
            channel: channel.events.$.bind(MessageTarget.Broadcast),
            serializer,
            log: true,
            thenable: false,
        })
    }

    return env
}
