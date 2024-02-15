import { Client, ClientInterface, FileImageResponse } from 'figma-js'
import { Config } from './config'

let client: ClientInterface
let documentId: string
let figmaToken: string

function initializeLoader(config: Config) {
  client = Client({
    personalAccessToken: config.figmaToken,
  })

  documentId = config.projectId
  figmaToken = config.figmaToken
}

function loadRoot() {
  return client.file(documentId, {
    depth: 1,
  })
}

async function loadDocumentNode(nodeId: string) {
  const response = await fetch(
    `https://api.figma.com/v1/files/${process.env.DOCUMENT_ID}/nodes?ids=${nodeId}&depth=100`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-FIGMA-TOKEN': figmaToken ?? '',
      },
    }
  )
  const result = await response.json()

  return result.nodes[nodeId].document
}

async function loadNodes(ids: string[]) {
  const { data } = await client.fileNodes(documentId, {
    ids,
  })
  return Object.values(data.nodes)
}

async function loadNode(nodeId: string) {
  const nodes = await loadNodes([nodeId])
  return nodes[0]
}

function loadSvgUrls(ids: string[]): Promise<Record<string, string>> {
  const queueSize = 500
  return new Promise(async (resolve) => {
    const res: Record<string, string> = {}

    const total = ids.length
    let loaded = 0

    while (ids.length) {
      console.log(`fetch icons meta: ${((loaded / total) * 100).toFixed(2)}%`)

      const { data } = await client.fileImages(documentId, {
        ids: ids.slice(0, queueSize),
        format: 'svg',
      })

      ids = ids.slice(queueSize)

      Object.assign(res, data.images)

      loaded += queueSize
    }

    console.log(`fetch icons meta: 100%`)

    resolve(res)
  })
}

export { initializeLoader, loadRoot, loadDocumentNode, loadSvgUrls, loadNode }
