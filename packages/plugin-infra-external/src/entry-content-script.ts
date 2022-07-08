import { createPluginHost } from './host.js'
import { startSiteAdaptorPlugin } from './core/env/site-adaptor.js'
export const createSiteAdaptorPluginHost = createPluginHost(startSiteAdaptorPlugin)
