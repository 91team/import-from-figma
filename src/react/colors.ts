import { Color } from 'figma-js'
import { Config } from '../config'

import { saveColorTheme, saveTailwindColors } from './resource'

type ColorData = {
  name: string
  color: Color
  opacity: number
}

const OPACITY_PRECISION = 3

function formatHex(rgbValue: number) {
  return rgbValue.toString(16).padStart(2, '0').toLocaleUpperCase()
}

function formatColor(color: Color, opacity: number) {
  const r = Math.round(color.r * 255)
  const g = Math.round(color.g * 255)
  const b = Math.round(color.b * 255)
  const precision = 10 ** OPACITY_PRECISION

  if (typeof opacity == 'number') {
    return `rgba(${r}, ${g}, ${b}, ${Math.round(opacity * precision) / precision})`
  }

  return `#${formatHex(r)}${formatHex(g)}${formatHex(b)}`
}

function parseColorName(fullName: string, withTheme: boolean) {
  const themeSeparatorIndex = withTheme ? fullName.indexOf('/') : -1
  const theme = withTheme
    ? fullName.slice(0, themeSeparatorIndex).trim().toLocaleLowerCase()
    : 'default'
  const name = fullName
    .slice(themeSeparatorIndex + 1)
    .trim()
    .toLocaleLowerCase()
    .replace(/[ /%()+#,".]+/g, '-')

  return {
    theme,
    name,
  }
}

async function writeColors(colors: ColorData[], config: Config) {
  const themes: Record<string, ColorData[]> = {}

  const multipleThemes = !!config.themes?.length

  if (multipleThemes) {
    config.themes?.forEach((theme) => {
      themes[theme] = []
    })
  } else {
    themes['default'] = []
  }

  colors.forEach((color) => {
    const { theme, name } = parseColorName(color.name, multipleThemes)

    if (themes[theme]) {
      themes[theme].push({
        ...color,
        name,
      })
    } else {
      console.log(`Error: incorrect color name '${color.name}'`)
    }
  })

  const tailwindColors: Record<string, string> = {}

  for (const theme of Object.keys(themes)) {
    const colorsCss = themes[theme]
      .filter((fill) => {
        if (fill.name.match(/[а-яА-Я]+/)) {
          console.log('incorrect color name: ' + fill.name)
          return false
        }
        return true
      })
      .sort((a, b) => (a.name < b.name ? -1 : 1))
      .map((fill) => {
        if (!fill.color) {
          console.log(`unsupported color: [${theme}] ${fill.name}`)
          return ''
        }

        const colorName = `--color-${fill.name}`
        tailwindColors[fill.name] = config.generateCss
          ? `var(${colorName})`
          : `${formatColor(fill.color, fill.opacity)}`
        return `${colorName}: ${formatColor(fill.color, fill.opacity)};`
      })
      .join('\n\t')

    if (config.generateCss) {
      const content = `:root${
        multipleThemes && config.getCssRootSelector ? config.getCssRootSelector(theme) : ''
      } { ${colorsCss} }`

      saveColorTheme(theme, content)
    }
  }

  saveTailwindColors(`module.exports = ${JSON.stringify(tailwindColors)}`)
}

export { writeColors }
