import { createElement, useMemo } from 'react'
import { useTranslation, Trans } from 'react-i18next'

const bind = (i18nKey: string) => (props: object) => createElement(Trans, { i18nKey, ns: 'shared', ...props })

export function createPluginI18N(pluginID: string) {
    function useTranslate() {
        const { t } = useTranslation(pluginID)
        return useMemo(
            function proxyBasedHooks() {
                return new Proxy({ __proto__: null } as any, {
                    get(target, key) {
                        if (typeof key !== 'string') throw new TypeError()
                        if (target[key]) return target[key]
                        return (target[key] = t.bind(null, key))
                    },
                })
            },
            [t],
        )
    }
    const Translate = new Proxy({ __proto__: null } as any, {
        get(target, key: string) {
            if (typeof key !== 'string') throw new TypeError()
            if (target[key]) return target[key]
            return (target[key] = bind(key))
        },
    })

    return { useTranslate, Translate }
}
