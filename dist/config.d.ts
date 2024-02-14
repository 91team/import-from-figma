import { Document } from 'figma-js'

export type Config = {
  figmaToken: string
  projectId: string
  exportType: 'react' | 'flutter'
  outputDir: string
  iconsDir?: string
  colorsDir?: string
  typographyDir?: string
  themes?: string[]
  getCssRootSelector?: (theme: string) => string
  generateCss?: boolean
  getNodesForExport: (
    document: Document
  ) => {
    typographyNodeId?: string
    colorsNodeId?: string
    iconsNodeId?: string
  }
}
