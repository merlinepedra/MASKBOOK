import { writeFile } from 'node:fs/promises'
import { join, relative } from 'path'
import { ROOT_PATH, walk } from '../utils'

export async function pluginList() {
    const files: string[] = []
    for await (const file of walk(
        join(ROOT_PATH, 'dist/external-plugins'),
        (path, isFolder) => isFolder || path.endsWith('.js'),
    )) {
        files.push(relative(join(ROOT_PATH, 'dist'), file).replace(/\\/g, '/'))
    }

    const content = `
${files.map((file) => `import('/${file}')`).join('\n')}

// completion value
undefined
    `
    await writeFile(join(ROOT_PATH, 'dist/plugin_loader.js'), content)
}

// export function pluginListWatch() {
//     const watcher = watch(dir, { ignoreInitial: false })
//     watcher.on('addDir', pluginList)
//     watcher.on('unlinkDir', pluginList)
//     return watcher
// }

// watchTask(pluginList, pluginListWatch, 'external-plugin-list', 'Generate plugin files list')
