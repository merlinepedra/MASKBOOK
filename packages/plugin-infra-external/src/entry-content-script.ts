import { createPluginHost } from './host.js'
import { startSiteAdaptorPlugin, type RunningSiteAdaptor, type SiteAdaptorHostHooks } from './core/env/site-adaptor.js'
import type { ObservableMap } from '@masknet/shared-base'
import type { Result } from 'ts-results'
export const createSiteAdaptorPluginHost: (
    hooks: SiteAdaptorHostHooks,
    signal: AbortSignal,
) => ObservableMap<string, Result<RunningSiteAdaptor, unknown> | Promise<Result<RunningSiteAdaptor, unknown>>> =
    createPluginHost(startSiteAdaptorPlugin)
