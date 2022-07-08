import { Compartment, URLResolveHook, type ModuleDescriptor } from '@masknet/compartment'
import { getPreloadedModule } from '../../utils/global-store.js'
import { endowmentGlobals } from './globals.js'

export function createCompartment(
    id: string,
    moduleMap: Record<string, ModuleDescriptor>,
    signal: AbortSignal,
): Compartment {
    const compartment = new Compartment({
        moduleMap,
        resolveHook: URLResolveHook,
        loadHook: (fullSpec) => {
            signal.throwIfAborted()
            return loadModuleOfPlugin(id, fullSpec)
        },
        globals: endowmentGlobals(id, null, signal),
    })
    Object.defineProperties(compartment.globalThis, {
        window: { value: compartment.globalThis },
        self: { value: compartment.globalThis },
    })

    return compartment
}

async function loadModuleOfPlugin(id: string, fullSpec: string) {
    if (fullSpec.startsWith('mask-plugin://') && !fullSpec.startsWith('mask-plugin://' + id)) {
        throw new Error('Import from other plugins is not supported.')
    }

    return getPreloadedModule(fullSpec)
}
