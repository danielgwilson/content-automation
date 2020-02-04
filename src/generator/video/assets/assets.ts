import { IPostSection } from "../../../types/post";

const srcPrefix = "file://";

export function getAssetsForSection(section: IPostSection, compName: string) {
  return section.type === "title"
    ? getAssetsForSectionTitle(section, compName)
    : getAssetsForSectionComment(section, compName);
}

function getAssetsForSectionTitle(section: IPostSection, compName: string) {
  const assets = [];

  assets.push({
    type: "data",
    layerName: "title-text",
    property: "Source Text",
    value: section.fragments[0].text
  });
  assets.push({
    src: `${srcPrefix}${section.fragments[0].audio.filePath}`,
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

  return assets;
}

function getAssetsForSectionComment(section: IPostSection, compName: string) {
  const assets = [];

  for (let [i, fragment] of section.fragments.entries()) {
    const sectionDelay = i === 0 ? 1 : 0;

    // Add new audio track containing fragment
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
      src: `${srcPrefix}${fragment.audio.filePath}`,
      layerIndex: 1,
      type: "audio"
    });
    assets.push({
      type: "data",
      layerIndex: 1,
      property: "name",
      value: `audio.${fragment.audio.filePath}`
    });
    assets.push({
      type: "data",
      layerIndex: 1,
      property: "outPoint",
      expression: "layer.startTime + layer.source.duration"
    });

    // Update comment text to show current fragment
    assets.push(
      getAssetForDuplicateLayer("comment-text", compName, {
        newName: `comment-text.${fragment.audio.filePath}`
      })
    );
    assets.push(
      getAssetForSetPropertyToParentProperty(
        {
          layer: {
            name: `comment-text.${fragment.audio.filePath}`,
            property: "startTime"
          },
          parent: {
            name: `audio.${fragment.audio.filePath}`,
            property: "startTime"
          }
        },
        compName
      )
    );
    assets.push(
      getAssetForSetPropertyToParentProperty(
        {
          layer: {
            name: `comment-text.${fragment.audio.filePath}`,
            property: "outPoint"
          },
          parent: {
            name: `audio.${fragment.audio.filePath}`,
            property: "outPoint"
          }
        },
        compName
      )
    );
    assets.push({
      type: "data",
      layerName: `comment-text.${fragment.audio.filePath}`,
      property: "Source Text",
      value: fragment.textWithPriors
    });
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
