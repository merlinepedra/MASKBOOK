// import { src, dest, watch, lastRun, series } from 'gulp'
// import { join } from 'path'
// import { ROOT_PATH, watchTask } from '../utils'

// // https://github.com/paulmillr/chokidar/issues/777 ?
// const source = join(ROOT_PATH, 'external-plugins', '**', '!(*.js)').replace(/\\/g, '/')
// const output = join(ROOT_PATH, 'dist', 'external-plugins').replace(/\\/g, '/')

// export function copyAssets() {
//     return src([source], { since: lastRun(copyAssets) }).pipe(dest(output))
// }

// export function copyAssetsWatch() {
//     return watch(source, { ignoreInitial: false }, series(copyAssets))
// }

// watchTask(copyAssets, copyAssetsWatch, 'external-plugin-assets-copy', 'Copy assets of external plugins')
