import fetch from 'node-fetch'
import { Color, FileResponse, TypeStyle, ComponentMetadata, Paint } from 'figma-js'
import { loadDocumentNode, loadNode, loadSvgUrls } from './loader'
import { Config } from './config'

const QUEUE_SIZE = 4

type Typography = Pick<
  TypeStyle,
  'italic' | 'fontWeight' | 'fontSize' | 'lineHeightPx' | 'fontFamily' | 'fontPostScriptName'
> & { name: string }

type ColorData = {
  name: string
  color: Color
  opacity: number
}

type IconName = string
type IconSVGContent = string

type Icons = Record<IconName, IconSVGContent>

type NodeWithChildrens = {
  type: string
  characters: string
  fills: Paint[]
  style: TypeStyle
  name: string
  children?: NodeWithChildrens[]
}

async function generateDSL(rawData: FileResponse, config: Config) {
  const { typographyNodeId, colorsNodeId, iconsNodeId } = config.getNodesForExport(rawData.document)

  return {
    typography: typographyNodeId ? await parseTypography(typographyNodeId) : undefined,
    colors: colorsNodeId ? await parseColors(colorsNodeId) : undefined,
    icons: iconsNodeId ? await parseIcons(iconsNodeId) : undefined,
  }
}

async function parseTypography(pageId: string): Promise<Typography[] | undefined> {
  const documentNode = await loadDocumentNode(pageId)

  if (!documentNode) {
    console.error(`documentNode not found for pageId: ${pageId}`)
    return
  }

  const textNodes = getRecursiveNodes(documentNode.children).filter((item) => item.type === 'TEXT')

  return textNodes.map((v) => ({
    name: v.name,
    ...v.style,
  }))
}

const getRecursiveNodes = (nodes: NodeWithChildrens[]): NodeWithChildrens[] => {
  return nodes.reduce<NodeWithChildrens[]>((acc, curr) => {
    if (curr.children) {
      acc.push(...getRecursiveNodes(curr.children))
    } else {
      acc.push(curr)
    }

    return acc
  }, [])
}

async function parseColors(pageId: string): Promise<ColorData[] | undefined> {
  const documentNode = await loadDocumentNode(pageId)

  if (!documentNode) {
    console.error(`documentNode not found for pageId:${pageId}`)
    return
  }

  const rectangleNodes = getRecursiveNodes(documentNode.children as NodeWithChildrens[]).filter(
    (item) => item.type === 'RECTANGLE'
  )

  const colors: ColorData[] = rectangleNodes.map((node) => ({
    name: node.name,
    color: node.fills[0].color!,
    opacity: node.fills[0].opacity!,
  }))

  return colors
}

function getIconName(meta: ComponentMetadata, parentName: string) {
  if (!parentName) {
    return meta.name
  }

  const props = meta.name.split(', ').map((name) => name.split('=')[1])

  return [parentName, ...props].join('-')
}

async function parseIcons(pageId: string): Promise<Icons | undefined> {
  const node = await loadNode(pageId)

  if (!node?.components) {
    return
  }

  // @ts-expect-error
  const { components, componentSets } = node
  const ids = Object.keys(components)

  const images = await loadSvgUrls(ids)

  const icons: Icons = {}

  const queue: Promise<unknown>[] = []

  let completed = 0

  for (const id of ids) {
    const iconUrl = images[id]
    // @ts-expect-error
    let parentName = componentSets[components[id].componentSetId]?.name || ''

    const saveIconPromise = fetch(iconUrl)
      .then((res) => res.text())
      .then((iconText) => (icons[getIconName(components[id], parentName)] = iconText))
      .catch((e) => console.log(e))

    if (queue.length === 0) {
      console.log(`fetch icons progress: ${((completed / ids.length) * 100).toFixed(2)}%`)
    }

    queue.push(saveIconPromise)

    if (queue.length === QUEUE_SIZE) {
      await Promise.all(queue)
      queue.length = 0
      completed += QUEUE_SIZE
    }
  }

  await Promise.all(queue)

  console.log(`fetch icons progress: 100%`)

  return icons
}

export { generateDSL, Typography, ColorData, Icons }
