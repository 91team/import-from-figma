import { Config } from './config'
import { generateDSL } from './dsl'
import { initializeLoader, loadRoot } from './loader'

import { generateReactArtifacts } from './react/react_generator'
import { initializeReactResource } from './react/resource'

async function importFromFigma(config: Config) {
  if (config.exportType == 'react') initializeReactResource(config)
  // if (config.exportType == 'flutter') initializeFlutterResource(config)

  initializeLoader(config)

  const { data } = await loadRoot()
  const { typography, colors, icons } = await generateDSL(data, config)

  if (config.exportType == 'react') generateReactArtifacts(config, typography, colors, icons)
  // if (config.exportType == 'flutter') generateReactArtifacts(typography, colors, icons);
}

export { importFromFigma }
