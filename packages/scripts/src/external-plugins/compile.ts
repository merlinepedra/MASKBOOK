import { transform } from '@swc/core'
import { src, dest, watch, lastRun, series, TaskFunctionCallback, parallel, TaskFunction } from 'gulp'
import { join } from 'path'
import { ROOT_PATH, task, watchTask } from '../utils'
import { Transform, TransformCallback } from 'stream'
import { readFileSync } from 'node:fs'

// https://github.com/paulmillr/chokidar/issues/777 ?
const fixGlob = (path: string) => path.replace(/\\/g, '/')

function builder(id: string, glob: string) {
    task(compile, 'external-plugin-build: ' + id, 'Build ' + id)
    return compile
    function compile() {
        const input = fixGlob(join(ROOT_PATH, glob, '**', '*.{mjs,js}'))
        const output = fixGlob(join(ROOT_PATH, 'dist', 'external-plugins', id))
        console.log(input, output)
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
                                    firstArg: 'mask-plugin://' + this.id + '/' + file.relative.replace(/\\/g, '/'),
                                },
                            },
                        ],
                    ],
                },
            },
        }).then(
            (output) => {
                file.contents = Buffer.from(output.code, 'utf-8')
                if (file.path.endsWith('.mjs')) file.path = file.path.replace(/\.mjs$/, '.js')
                callback(null, file)
            },
            (err) => callback(err),
        )
    }
}
