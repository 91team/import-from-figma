import { Config } from '../config'
import { ColorData, Icons, Typography } from '../dsl'

import { writeColors } from './colors'
import { writeFonts } from './fonts'
import { writeIcons } from './icons'

function generateReactArtifacts(
  config: Config,
  typographies?: Typography[],
  colors?: ColorData[],
  icons?: Icons
) {
  if (typographies) {
    writeFonts(typographies, config)
  }

  if (colors) {
    writeColors(colors, config)
  }

  if (icons) {
    writeIcons(icons)
  }
}

export { generateReactArtifacts }
