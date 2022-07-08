import { createModuleCache } from '@masknet/compartment'
import * as ts_results from 'ts-results'
import { Identifier, PostIdentifier, ECKeyIdentifier, ProfileIdentifier, PostIVIdentifier } from '@masknet/shared-base'

const modules = createModuleCache()
modules.addNamespace('ts-results', ts_results)

modules.addModuleRecord('@mask-net/base', {
    initialize() {},
    bindings: [{ export: '*', from: '@mask-net/base/identifier.js' }],
})
modules.addNamespace('@mask-net/base/identifier.js', {
    Identifier,
    PostIdentifier,
    ECKeyIdentifier,
    ProfileIdentifier,
    PostIVIdentifier,
})

export const peerDeps = modules.moduleMap
