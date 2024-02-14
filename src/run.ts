import * as dotenv from 'dotenv'
import { importFromFigma } from './importFromFigma'

dotenv.config()

importFromFigma({
  figmaToken: process.env.FIGMA_TOKEN!,
  projectId: process.env.DOCUMENT_ID!,
  exportType: 'react',
  outputDir: './generated',
  // themes: ['light', 'dark'],
  getCssRootSelector: (theme) => `[data-theme='${theme}']`,
  generateCss: true,
  getNodesForExport: (document) => {
    const typographyPage = document.children.find((page) => page.name.includes('Typography'))
    const colorsPage = document.children.find((page) => page.name.includes('Colors'))
    const iconsPage = document.children.find((page) => page.name.includes('Icons'))

    return {
      typographyNodeId: typographyPage?.id,
      colorsNodeId: colorsPage?.id,
      iconsNodeId: iconsPage?.id,
    }
  },
})
