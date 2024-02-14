import { Icons } from '../dsl'

import { saveIconComponent, saveIconsIndex, saveIconSvg } from './resource'

const currentColor = 'black'
const currentColorRegexp = new RegExp(currentColor, 'g')

const namesMap: Record<string, string> = {}

function formatComponentName(name: string) {
  const words = name
    .replace(/[^a-z0-9]+/gi, ' ')
    .trim()
    .split(' ')

  return 'Icon' + words.map((word) => word.slice(0, 1).toLocaleUpperCase() + word.slice(1)).join('')
}

function formatSvgPath(name: string) {
  const formattedName = name.replace(/\s+/gi, '').replace(/[^a-z0-9-_]/gi, '_')

  return `svg/${formattedName}.svg`
}

function saveIcon(name: string, text: string) {
  if (!text) {
    console.log(`incorrect icon: ${name}`)
    return
  }

  const componentName = formatComponentName(name)
  const svgText = text.replace(currentColorRegexp, 'currentColor')

  if (namesMap[componentName]) {
    console.log(`Name conflict: '${name}' and '${namesMap[componentName]}'`)
    return
  }

  namesMap[componentName] = name

  const svgPath = formatSvgPath(name)
  const width = /width="(\d+)"/.exec(svgText)![1]
  const height = /height="(\d+)"/.exec(svgText)![1]

  const component = `
    import React, { forwardRef } from 'react'

    import iconId from './${svgPath}'
    
    type TProps = { 
      className?: string 
    }

    const ${componentName} = forwardRef<SVGSVGElement, TProps>(
      ({ className, ...props }, ref) => (
        <svg ref={ref} width="${width}" height="${height}" className={className} {...props}>
          <use xlinkHref={\`#\${iconId}\`} />
        </svg>
      )
    )
    
    export { ${componentName} }
`

  saveIconComponent(componentName, component)
  saveIconSvg(svgPath, svgText)
}

async function writeIcons(icons: Icons) {
  Object.keys(icons).forEach((key) => saveIcon(key, icons[key]))

  // saveIconsIndex()
}

export { writeIcons }
