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

function updateTextLayer(layer: string | number, text: string, comp: CompItem) {
  const textLayer = (typeof layer === "string"
    ? comp.layer(layer)
    : comp.layer(layer)) as TextLayer;
  return textLayer.text.sourceText.setValue(new TextDocument(text));
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
