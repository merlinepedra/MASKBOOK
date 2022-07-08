import { createPluginHost } from './host.js'
import { startWorkerPlugin } from './core/env/worker.js'
export const createWorkerPluginHost = createPluginHost(startWorkerPlugin)
