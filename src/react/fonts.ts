import { Config } from '../config'
import { Typography } from '../dsl'
import { saveFontsCss, saveTailwindFonts } from './resource'

const fontWeightReloads: Record<string, number> = {
  'Inter-SemiBold': 600,
}

function formatFont(fontNode: Typography) {
  let { italic, fontWeight, fontSize, lineHeightPx, fontFamily, fontPostScriptName } = fontNode

  return [
    italic ? 'italic' : null,
    fontWeightReloads[fontPostScriptName] || fontWeight,
    `${fontSize / 16}rem/${lineHeightPx / 16}rem`,
    `'${fontFamily}'`,
  ]
    .filter((v) => v)
    .join(' ')
}

async function writeFonts(typographies: Typography[], config: Config) {
  const fonts: Record<string, any> = {}

  const variablesText = typographies
    .filter((node) => {
      if (node.name.match(/[а-яА-Я]+/)) {
        console.log('incorrect font name: ' + node.name)
        return false
      }
      return true
    })
    .map((node) => ({
      ...node,
      name: node.name.toLocaleLowerCase().replace(/[ /%()+#,".]+/g, '-'),
    }))
    .sort((a, b) => (a.name < b.name ? -1 : 1))
    .map((node) => {
      const fontName = node.name
      const varName = `--font-${fontName}`
      fonts[`.font-${fontName}`] = {
        font: config.generateCss ? `var(${varName})` : `${formatFont(node)}`,
      }
      return `${varName}: ${formatFont(node)};`
    })
    .join('\n\t')

  if (config.generateCss) {
    const content = `:root { ${variablesText} }`

    saveFontsCss(content)
  }

  saveTailwindFonts(`module.exports = ${JSON.stringify(fonts)}`)
}

export { writeFonts }
