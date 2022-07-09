import { Compartment, createModuleCache } from '@masknet/compartment'
import { createCompartment } from './compartment.js'
import { combineAbortSignal } from '@dimensiondev/kit'
import { peerDepsDOM } from '../modules/peer-deps-dom.js'
import { getPluginManifest } from '../../utils/global-store.js'
import { getURL } from '../../utils/url.js'
import { Environment, WebExtensionMessage } from '@dimensiondev/holoflows-kit'
import { AsyncCall } from 'async-call-rpc'
import { serializer } from '@masknet/shared-base'
import { createPluginI18N } from '../internal/i18n-dom.js'
import { usePluginWrapper } from '@masknet/plugin-infra/content-script'

export interface RunningSiteAdaptor {
    abort(): void
    signal: AbortSignal
    compartment: Compartment
    hooks: SiteAdaptorPluginHooks
}
export interface SiteAdaptorPluginHooks {}
export interface SiteAdaptorHostHooks {}

function createSiteAdaptorEnv(id: string, host: SiteAdaptorHostHooks, parentSignal: AbortSignal): RunningSiteAdaptor {
    const abortController = new AbortController()
    const signal = combineAbortSignal(parentSignal, abortController.signal)

    const modules = createModuleCache()
    Object.setPrototypeOf(modules.moduleMap, peerDepsDOM)

    const compartment = createCompartment(id, modules.moduleMap, signal)

    // Setup RPC
    {
        const channel = new WebExtensionMessage<{ _: any; $: any }>({ domain: `mask-plugin-${id}-rpc` })
        modules.addNamespace('@masknet/plugin/utils/rpc', {
            worker: AsyncCall(null, {
                channel: channel.events._.bind(Environment.ManifestBackground),
                log: true,
                thenable: false,
                serializer,
            }),
            workerGenerator: AsyncCall(null, {
                channel: channel.events.$.bind(Environment.ManifestBackground),
                log: true,
                thenable: false,
                serializer,
            }),
        })
    }

    // Setup plugin hooks
    {
        const { Translate, useTranslate } = createPluginI18N(id)
        modules.addNamespace('@masknet/plugin-hooks', {
            usePluginWrapper,
            Translate,
            useTranslate,
        })
    }

    const hooks: SiteAdaptorPluginHooks = {}

    return { compartment, hooks, abort: () => abortController.abort(), signal }
}

export async function startSiteAdaptorPlugin(id: string, host: SiteAdaptorHostHooks, parentSignal: AbortSignal) {
    const manifest = getPluginManifest(id)
    if (!manifest) throw new Error(`Plugin ${id} does not have a valid manifest.`)

    const { content_script } = manifest.entries || {}
    const env = createSiteAdaptorEnv(id, host, parentSignal)

    // this plugin does not need to be started in the content_script.
    if (!content_script) return env

    await env.compartment.import(getURL(id, content_script))
    return env
}
