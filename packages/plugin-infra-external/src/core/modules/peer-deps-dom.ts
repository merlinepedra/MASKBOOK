import { createModuleCache } from '@masknet/compartment'
import * as react from 'react'
import * as react_jsx_runtime from 'react/jsx-runtime'
import * as react_dom from 'react-dom'
import * as mui_material from '@mui/material'
import { makeStyles, MaskDialog } from '@masknet/theme'
import * as masknet_icons from '@masknet/icons'
import { peerDeps } from './peer-deps.js'

const modules = createModuleCache()
Object.setPrototypeOf(modules.moduleMap, peerDeps)
modules.addNamespace('react', react)
modules.addNamespace('react-dom', react_dom)
modules.addNamespace('react/jsx-runtime', react_jsx_runtime)
modules.addNamespace('@mui/material', mui_material)
modules.addNamespace('@masknet/theme', {
    makeStyles,
    MaskDialog,
})

modules.addNamespace('@masknet/icons', masknet_icons)

export const peerDepsDOM = modules.moduleMap
