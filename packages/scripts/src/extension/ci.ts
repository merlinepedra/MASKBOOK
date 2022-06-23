#!/usr/bin/env ts-node
import git from '@nice-labs/git-rev'
import zip from 'gulp-zip'
import { extension as buildBaseVersion, ExtensionBuildArgs } from './normal'
import { dest, src, series, parallel, TaskFunction } from 'gulp'
import { BUILD_PATH, ROOT_PATH, task } from '../utils'
import { codegen } from '../codegen'
import path from 'path'

export const ciBuild = series(
    printBranchName,
    codegen,
    // The base version need to be build in serial in order to prepare webpack cache.
    buildBaseVersion,
    // If we build parallel on CI, it will be slower eventually
    (process.env.CI ? series : parallel)(
        // zip base version to zip
        zipTo(BUILD_PATH, 'MaskNetwork.base.zip'),
        // Chrome version is the same with base version
        zipTo(BUILD_PATH, 'MaskNetwork.chromium.zip'),
        buildTarget('Android', { android: true, 'output-path': 'build-android' }, 'MaskNetwork.gecko.zip'),
        buildTarget('iOS', { iOS: true, 'output-path': 'build-iOS' }, 'MaskNetwork.iOS.zip'),
        buildTarget('Firefox', { firefox: true, 'output-path': 'build-firefox' }, 'MaskNetwork.firefox.zip'),
        buildTarget(
            'Chromium-beta',
            { chromium: true, beta: true, 'output-path': 'build-chromium-beta' },
            'MaskNetwork.chromium-beta.zip',
        ),
        buildTarget(
            'Firefox-e2e',
            { firefox: true, e2e: true, 'output-path': 'build-firefox-e2e' },
            'MaskNetwork.firefox-e2e.zip',
        ),
        buildTarget(
            'Chromium-e2e',
            { chromium: true, e2e: true, 'output-path': 'build-chromium-e2e' },
            'MaskNetwork.chromium-e2e.zip',
        ),
    ),
)
task(ciBuild, 'build-ci', 'Build the extension on CI')
function buildTarget(name: string, options: ExtensionBuildArgs, outFile: string) {
    options.readonlyCache = true
    options['output-path'] = path.join(ROOT_PATH, options['output-path']!)
    return series(buildWith(name, options), zipTo(options['output-path']!, outFile))
}
function zipTo(absBuildDir: string, fileName: string): TaskFunction {
    const f: TaskFunction = () =>
        src(`./**/*`, { cwd: absBuildDir })
            .pipe(zip(fileName))
            .pipe(dest('./', { cwd: ROOT_PATH }))
    f.displayName = `zip ${absBuildDir} into ${fileName}`
    return f
}
function buildWith(name: string, buildArgs: ExtensionBuildArgs) {
    const f: TaskFunction = () => buildBaseVersion(buildArgs)
    f.displayName = `Build target ${name}`
    return f
}

async function printBranchName() {
    console.log('Building on branch: ', git.branchName())
}
