/// <reference types="types-for-adobe/aftereffects/2018"/>

function getComp(compName: string) {
  let comp: CompItem | undefined;
  for (let i = 1; i <= app.project.numItems; i++) {
    if (
      app.project.item(i) instanceof CompItem &&
      app.project.item(i).name === compName
    ) {
      comp = app.project.item(i) as CompItem;
      break;
    }
  }
  if (!comp) throw new Error(`Failed to find comp named ${compName}`);
  return comp;
}

function importFootage(filePath: string) {
  const file = new File(filePath);

  if (!file.exists) throw new Error(`File not found: ${filePath}`);

  const importOptions = new ImportOptions(file);
  //importOptions.importAs = ImportAsType.COMP; // you can do stuff like this at this point for PSDs
  return app.project.importFile(importOptions) as AVItem;
}

function addLayer(
  item: AVItem,
  comp: CompItem,
  { name }: { name?: string } = {}
) {
  const layer = comp.layers.add(item);
  layer.name = name ?? layer.name;
  return layer;
}

function duplicateLayer(
  layer: string | number,
  comp: CompItem,
  newName: string
) {
  const target =
    typeof layer === "string" ? comp.layer(layer) : comp.layer(layer);
  const dupe = target.duplicate();
  dupe.name = newName;
  return dupe;
}

function copyLayerToComp(
  layer:
    | Layer
    | { name: string; comp: CompItem }
    | { index: number; comp: CompItem },
  copy: { name?: string; comp: CompItem }
) {
  const targetLayer =
    layer instanceof Layer
      ? layer
      : (("name" in layer
          ? layer.comp.layer(layer.name)
          : layer.comp.layer(layer.index)) as Layer);
  targetLayer.copyToComp(copy.comp);
  const newLayer = copy.comp.layer(1); // potential bug if layer already selected
  if (copy.name) newLayer.name = copy.name;
  return newLayer;
}

function updateTextLayer(
  layer:
    | TextLayer
    | { name: string; comp: CompItem }
    | { index: number; comp: CompItem },
  text: string
) {
  const textLayer =
    layer instanceof TextLayer
      ? layer
      : (("name" in layer
          ? layer.comp.layer(layer.name)
          : layer.comp.layer(layer.index)) as TextLayer);
  return textLayer.text.sourceText.setValue(new TextDocument(text));
}

function updateTextLayerAtTime(
  layer:
    | TextLayer
    | { name: string; comp: CompItem }
    | { index: number; comp: CompItem },
  text: string,
  time: number
) {
  const textLayer =
    layer instanceof TextLayer
      ? layer
      : (("name" in layer
          ? layer.comp.layer(layer.name)
          : layer.comp.layer(layer.index)) as TextLayer);
  return textLayer.text.sourceText.setValueAtTime(time, new TextDocument(text));
}

function updateTextLayerAtTimes(
  layer:
    | TextLayer
    | { name: string; comp: CompItem }
    | { index: number; comp: CompItem },
  texts: string[],
  times: number[]
) {
  const textLayer =
    layer instanceof TextLayer
      ? layer
      : (("name" in layer
          ? layer.comp.layer(layer.name)
          : layer.comp.layer(layer.index)) as TextLayer);

  const textDocuments: TextDocument[] = [];
  for (let text of texts) {
    textDocuments.push(new TextDocument(text));
  }
  return textLayer.text.sourceText.setValuesAtTimes(times, textDocuments);
}

function updateLayerAtTimes(
  layer:
    | Layer
    | { name: string; comp: CompItem }
    | { index: number; comp: CompItem },
  property: string,
  times: number[],
  values: number[],
  { interpolationType }: { interpolationType?: KeyframeInterpolationType } = {}
) {
  const myLayer =
    layer instanceof Layer
      ? layer
      : (("name" in layer
          ? layer.comp.layer(layer.name)
          : layer.comp.layer(layer.index)) as Layer);

  const prop = myLayer.property(property) as Property;

  prop.setValuesAtTimes(times, values);

  if (interpolationType) {
    for (let time of times) {
      prop.setInterpolationTypeAtKey(
        prop.nearestKeyIndex(time),
        interpolationType
      );
    }
  }
}

function getFootageItem(itemName: string) {
  let item: FootageItem | undefined;
  for (let i = 1; i <= app.project.numItems; i++) {
    if (
      app.project.item(i) instanceof FootageItem &&
      app.project.item(i).name === itemName
    ) {
      item = app.project.item(i) as FootageItem;
      break;
    }
  }
  if (!item) throw new Error(`Failed to find item named ${itemName}`);
  return item;
}
