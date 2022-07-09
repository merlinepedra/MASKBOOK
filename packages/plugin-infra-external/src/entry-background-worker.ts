import { createPluginHost } from './host.js'
import { startWorkerPlugin, type RunningWorker, type WorkerPluginHostHooks } from './core/env/worker.js'
import type { ObservableMap } from '@masknet/shared-base'
import type { Result } from 'ts-results'
export const createWorkerPluginHost: (
    hooks: WorkerPluginHostHooks,
    signal: AbortSignal,
) => ObservableMap<string, Result<RunningWorker, unknown> | Promise<Result<RunningWorker, unknown>>> =
    createPluginHost(startWorkerPlugin)
