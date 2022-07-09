import { transform } from '@swc/core'
import { src, dest, watch, lastRun, series, TaskFunctionCallback, parallel, TaskFunction } from 'gulp'
import { join } from 'path'
import { ROOT_PATH, task, watchTask } from '../utils'
import { Transform, TransformCallback } from 'stream'
import { readFileSync } from 'node:fs'
import { prettier } from '../utils/prettier'

// https://github.com/paulmillr/chokidar/issues/777 ?
const fixGlob = (path: string) => path.replace(/\\/g, '/')

function builder(id: string, glob: string) {
    task(compile, 'external-plugin-build: ' + id, 'Build ' + id)
    return compile
    function compile() {
        const input = fixGlob(join(ROOT_PATH, glob, '**', '*.{mjs,js,json}'))
        const output = fixGlob(join(ROOT_PATH, 'dist', 'external-plugins', id))
        return src([input], {
            since: lastRun(compile),
            cwd: ROOT_PATH,
        })
            .pipe(new PluginTransform(id))
            .pipe(dest(output))
    }
}
export function compile(callback: TaskFunctionCallback): any {
    const json = JSON.parse(readFileSync(join(ROOT_PATH, '.mask-external-plugins.dev.json'), 'utf8'))
    const tasks: TaskFunction[] = []
    for (const key in json) tasks.push(builder(key, json[key]))
    return series(...tasks)(callback)
}

export function compileWatch(callback: TaskFunctionCallback): any {
    const json = JSON.parse(readFileSync(join(ROOT_PATH, '.mask-external-plugins.dev.json'), 'utf8'))
    const tasks: TaskFunction[] = []
    for (const key in json) {
        const build = builder(key, json[key])
        function watcher() {
            const input = fixGlob(join(ROOT_PATH, json[key], '**', '*.js'))
            return watch(input, { ignoreInitial: false }, build)
        }
        task(watcher, 'external-plugin-watch: ' + key, 'Watch the build of ' + key)
        tasks.push(watcher)
    }
    console.log(tasks)
    return parallel(...tasks)(callback)
}

watchTask(
    compile,
    compileWatch,
    'external-plugin-compiler',
    'Compile files into static module record so they can be run in the compartment',
)

class PluginTransform extends Transform {
    constructor(public id: string) {
        super({ objectMode: true, defaultEncoding: 'utf-8' })
    }
    override _transform(file: any, encoding: BufferEncoding, callback: TransformCallback): void {
        const virtualPath = 'mask-plugin://' + this.id + '/' + file.relative.replace(/\\/g, '/')

        if (file.relative.endsWith('.json')) {
            const content = `{
const json = ${JSON.stringify(JSON.stringify(JSON.parse(file.contents.utf8Slice().replace(/\s+\/\/.+/g, ''))))};
__mask__compartment__define__(${JSON.stringify(virtualPath)}, { initialize(env) { env.default = JSON.parse(json) } });
${
    file.relative === 'mask-manifest.json'
        ? `__mask__compartment__manifests__.set(${JSON.stringify(this.id)}, JSON.parse(json))`
        : ''
}
}`
            file.path = file.path + '.js'
            prettier(content)
                .then((data) => (file.contents = Buffer.from(data, 'utf-8')))
                .then(() => callback(null, file))
            return
        }
        const wasm = require.resolve('@masknet/static-module-record-swc')

        transform(file.contents.utf8Slice(), {
            jsc: {
                target: 'es2022',
                experimental: {
                    plugins: [
                        [
                            wasm,
                            {
                                template: {
                                    type: 'callback',
                                    callback: '__mask__compartment__define__',
                                    firstArg: virtualPath,
                                },
                            },
                        ],
                    ],
                },
            },
        }).then(
            (output) => {
                file.contents = Buffer.from(output.code, 'utf-8')
                file.path = file.path + '.js'
                callback(null, file)
            },
            (err) => callback(err),
        )
    }
}
