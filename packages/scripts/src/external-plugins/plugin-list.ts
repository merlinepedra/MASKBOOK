import { watch } from 'gulp'
import { noop } from 'lodash-unified'
import { readdir, writeFile, stat } from 'node:fs/promises'
import { join } from 'path'
import { ROOT_PATH, watchTask } from '../utils'
import { prettier } from '../utils/prettier'

// export async function pluginList() {
//     const out = JSON.stringify(list.filter(Boolean))
//     const file = `// This file is expected to be overritten by the build process. Do not override it.
// globalThis.__mask__register__external__plugins__ = ${out}

// // As the return value of the executeScript
// undefined`
//     return writeFile(join(dir, 'plugin-list.js'), await prettier(file)).catch(noop)
// }
// function isDirectory(path: string) {
//     return stat(join(dir, path)).then((s) => (s.isDirectory() ? path : null))
// }

// export function pluginListWatch() {
//     const watcher = watch(dir, { ignoreInitial: false })
//     watcher.on('addDir', pluginList)
//     watcher.on('unlinkDir', pluginList)
//     return watcher
// }

// watchTask(pluginList, pluginListWatch, 'external-plugin-list', 'Generate plugin list')
