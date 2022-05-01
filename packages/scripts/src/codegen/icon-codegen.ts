import * as fs from 'fs'
import glob from 'glob-promise'
import { watch } from 'gulp'
import { camelCase } from 'lodash-unified'
import * as path from 'path'
import { prettier, ROOT_PATH, watchTask } from '../utils'

const pattern = 'packages/icons/**/*.@(svg|jpe?g|png)'
const iconRoot = path.resolve(__dirname, '../../../icons')
const CODE_FILE = path.resolve(iconRoot, 'icon-data.tsx')

const currentColorRe = /\w=('|")currentColor\1/

const hasCurrentColor = (code: string) => currentColorRe.test(code)

function svg2jsx(code: string) {
    return (
        code
            .trim()
            // set both height and width to 100%, let svg's container, aka <Icon />, decide the size
            // We don't use g flag here, because we only want to change the first attribute of each
            .replace(/\b(height)=('|")\d+\2/, '')
            .replace(/\b(width)=('|")\d+\2/, '')
            .replace(/(\w+-\w+)=('|").*?\2/g, (p: string, m1: string) => {
                return p.replace(m1, camelCase(m1))
            })
    )
}

const responseExtRe = /\.(light|dim|dark)$/
const responseNameRe = /(.*)\.(light|dim|dark)$/
export async function generateIcons() {
    const nameMap: Record<string, string> = {}
    const iconsWithDynamicColor: string[] = []
    const lines: string[] = []
    const indexNames = new Set<string>()
    const iconVarNames = new Map<string, string>()
    const typeNames = new Set<string>()

    const filePaths = await glob.promise(pattern, { cwd: ROOT_PATH, nodir: true })
    filePaths.forEach((filePath) => {
        const parsed = path.parse(filePath)
        const fileName = parsed.base
        let varName = ''
        const name = parsed.name.match(responseNameRe)
            ? parsed.name.replace(responseNameRe, (matchedName, m1, m2) => {
                  varName = camelCase(matchedName)
                  if (m2 === 'light') return camelCase(m1)
                  return `${camelCase(m1)}.${m2}`
              })
            : camelCase(parsed.name)
        if (name.toLowerCase() === 'redpacket') {
            return
        }
        indexNames.add(name)
        iconVarNames.set(name, `${varName || camelCase(name)}Icon`)
        if (name.match(responseExtRe)) {
            typeNames.add(name.replace(responseExtRe, ''))
        } else {
            typeNames.add(name)
        }
        nameMap[name] = fileName
        const isSvg = parsed.ext.toLowerCase() === '.svg'
        const code = isSvg ? fs.readFileSync(filePath, 'utf8') : ''
        if (isSvg && hasCurrentColor(code)) {
            iconsWithDynamicColor.push(name)
            lines.push(`export const ${iconVarNames.get(name)} = ${svg2jsx(code)}`)
        } else {
            const importPath = path.relative(iconRoot, path.join(ROOT_PATH, filePath))
            // console.log('from', iconRoot)
            // console.log('to', path.join(ROOT_PATH, filePath))
            // console.log('importPath', importPath)
            lines.push(`export const ${iconVarNames.get(name)} = new URL("./${importPath}", import.meta.url).href`)
        }
    })

    const declareType = `export type IconType = ${Array.from(typeNames, (v) => JSON.stringify(v)).join(' | ')}`
    const defaultExport = `const icons = {
    ${Array.from(indexNames)
        .map((name) => `${JSON.stringify(name)}:${iconVarNames.get(name)}`)
        .join(',')}
  }
  export default icons`

    return `
  ${declareType}
  ${lines.join('\n')}

  export const iconsWithDynamicColor = ${JSON.stringify(iconsWithDynamicColor)}

  ${defaultExport}`
}

async function generate() {
    const code = await generateIcons()
    const prettied = await prettier(code)

    console.log('Writing to', CODE_FILE)
    fs.writeFileSync(CODE_FILE, prettied)
}

export async function iconCodegen() {
    await generate()
}

export async function iconCodegenWatch() {
    watch(pattern, iconCodegen)
}

watchTask(iconCodegen, iconCodegenWatch, 'icon-codegen', 'Generate icons')
