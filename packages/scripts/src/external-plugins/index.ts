import { parallel, series } from 'gulp'
import { watchTask } from '../utils'
import { compile, compileWatch } from './compile'
// import { copyAssets, copyAssetsWatch } from './copy'
import { pluginList } from './plugin-list'

// Tasks:
// Generate plugin list
// Generate preload file list (MV3)
export const externalPlugin = series(compile, pluginList)
export const externalPluginWatch = parallel(compileWatch)

watchTask(externalPlugin, externalPluginWatch, 'external-plugin', 'Compile external plugin')
