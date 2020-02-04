import { PostSection } from "../../types/post";

export function getAssetsForSection(section: PostSection, compName: string) {
  const srcPrefix = "file://";
  const sectionDelay = 1;
  const assets = [];

  if (section.type === "title") {
    assets.push({
      type: "data",
      layerName: "title-text",
      property: "Source Text",
      value: section.fragments[0].text
    });
    assets.push({
      src: `${srcPrefix}${section.fragments[0].audio.fileName}`,
      layerName: "audio",
      type: "audio"
    });
    assets.push({
      type: "data",
      layerIndex: 1,
      property: "outPoint",
      expression: "layer.startTime + layer.source.duration"
    });
    assets.push(
      getAssetForSetPropertyToParentProperty(
        {
          layer: { name: "title-text", property: "outPoint" },
          parent: { index: 1, property: "outPoint" }
        },
        compName
      )
    );
  } else {
    assets.push(getAssetForDuplicateLayer(1, compName));
    assets.push(
      getAssetForSetPropertyToParentProperty(
        {
          layer: { index: 1, property: "startTime" },
          parent: { index: 2, property: "outPoint" }
        },
        compName
      )
    );
    assets.push({
      type: "data",
      layerIndex: 1,
      property: "startTime",
      expression: `layer.startTime + ${sectionDelay}`
    });
    assets.push({
      src: `${srcPrefix}${section.fragments[0].audio.fileName}`,
      layerIndex: 1,
      type: "audio"
    });
    assets.push({
      type: "data",
      layerIndex: 1,
      property: "name",
      value: `audio.${section.fragments[0].audio.fileName}`
    });
    assets.push({
      type: "data",
      layerIndex: 1,
      property: "outPoint",
      expression: "layer.startTime + layer.source.duration"
    });
    assets.push(
      getAssetForDuplicateLayer("comment-text", compName, {
        newName: `comment-text.${section.fragments[0].audio.fileName}`
      })
    );
    assets.push({
      type: "data",
      layerName: `comment-text.${section.fragments[0].audio.fileName}`,
      property: "Source Text",
      value: section.fragments[0].text
    });
    assets.push(
      getAssetForSetPropertyToParentProperty(
        {
          layer: {
            name: `comment-text.${section.fragments[0].audio.fileName}`,
            property: "startTime"
          },
          parent: { index: 1, property: "startTime" }
        },
        compName
      )
    );
    assets.push(
      getAssetForSetPropertyToParentProperty(
        {
          layer: {
            name: `comment-text.${section.fragments[0].audio.fileName}`,
            property: "outPoint"
          },
          parent: { index: 1, property: "outPoint" }
        },
        compName
      )
    );
  }

  return assets;
}

export function getAssetForSetPropertyToParentProperty(
  {
    layer,
    parent
  }: {
    layer:
      | { name: string; property: string }
      | { index: number; property: string };
    parent:
      | { name: string; property: string }
      | { index: number; property: string };
  },
  compName: string
) {
  const asset = {
    type: "data",
    property: `${layer.property}`,
    expression: `
      var comp;
      for (var i = 1; i <= app.project.numItems; i++) {
          if ((app.project.item(i) instanceof CompItem) && (app.project.item(i).name === "${compName}")) {
              comp = app.project.item(i);
              break;
          }
      }
      comp.layer(${
        "name" in parent ? '"' + parent.name + '"' : parent.index
      }).${parent.property};
    `
  };
  return "name" in layer
    ? { layerName: layer.name, ...asset }
    : { layerIndex: layer.index, ...asset };
}

export function getAssetForDuplicateLayer(
  layer: string | number,
  compName: string,
  { newName }: { newName?: string } = {}
) {
  const asset = {
    type: "data",
    property: "startTime",
    expression: `
      var comp;
      for (var i = 1; i <= app.project.numItems; i++) {
          if ((app.project.item(i) instanceof CompItem) && (app.project.item(i).name === "${compName}")) {
              comp = app.project.item(i);
              break;
          }
      }

      var target = comp.layer(${
        typeof layer === "string" ? '"' + layer + '"' : layer
      });
      var dupe = target.duplicate();
      dupe.name = ${newName ? '"' + newName + '"' : 'target.name + "_copy"'};

      layer.startTime;
    `
  };
  return typeof layer === "string"
    ? { layerName: layer, ...asset }
    : { layerIndex: layer, ...asset };
}

export function getAssetForUpdateCompLength(compName: string) {
  return {
    type: "data",
    property: "startTime",
    expression: `
      var comp;
      for (var i = 1; i <= app.project.numItems; i++) {
          if ((app.project.item(i) instanceof CompItem) && (app.project.item(i).name === "${compName}")) {
              comp = app.project.item(i);
              break;
          }
      }
      comp.duration = comp.layer(1).outPoint;

      layer.startTime;
    `,
    layerIndex: 1
  };
}
