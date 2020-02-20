import { getSrcForPath } from "./util";

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
  compName: string,
  parentCompName?: string
) {
  const asset = {
    type: "data",
    composition: compName,
    layerIndex: 1,
    property: "name",
    expression: `
      var comp;
      var parentComp;
      for (var i = 1; i <= app.project.numItems; i++) {
          if (app.project.item(i) instanceof CompItem) {
              if (app.project.item(i).name === "${compName}") {
                  comp = app.project.item(i);
                  ${parentCompName ? "if (parentComp) break;" : "break;"}
              } else if (${
                parentCompName
                  ? "app.project.item(i).name === " + '"' + parentCompName + '"'
                  : "false"
              }) {
                  parentComp = app.project.item(i);
                  if (comp) break;
              }
          }
      }
      if (!comp) throw new Error("Failed to find comp");
      ${
        parentCompName
          ? 'if (!parentComp) throw new Error("Failed to find parentComp");'
          : ""
      }

      comp.layer(${
        "name" in layer ? '"' + layer.name + '"' : layer.index
      }).property("${layer.property}").setValue(${
      parentCompName ? "parentComp" : "comp"
    }.layer(${"name" in parent ? '"' + parent.name + '"' : parent.index}).${
      parent.property
    });

      layer.name;
    `
  };
  return asset;
}

export function getAssetForSetPropertyAtParentInPoint(
  {
    layer,
    parent
  }: {
    layer:
      | { name: string; property: string; value: string | number }
      | { index: number; property: string; value: string | number };
    parent: { name: string } | { index: number };
  },
  compName: string,
  parentCompName?: string
) {
  const asset = {
    type: "data",
    composition: compName,
    layerIndex: 1,
    property: "name",
    expression: `
      var comp;
      var parentComp;
      for (var i = 1; i <= app.project.numItems; i++) {
          if (app.project.item(i) instanceof CompItem) {
              if (app.project.item(i).name === "${compName}") {
                  comp = app.project.item(i);
                  ${parentCompName ? "if (parentComp) break;" : "break;"}
              } else if (${
                parentCompName
                  ? "app.project.item(i).name === " + '"' + parentCompName + '"'
                  : "false"
              }) {
                  parentComp = app.project.item(i);
                  if (comp) break;
              }
          }
      }
      if (!comp) throw new Error("Failed to find comp");
      ${
        parentCompName
          ? 'if (!parentComp) throw new Error("Failed to find parentComp");'
          : ""
      }

      comp.layer(${
        "name" in layer ? '"' + layer.name + '"' : layer.index
      }).property("${layer.property}").setValueAtTime(${
      parentCompName ? "parentComp" : "comp"
    }.layer(${
      "name" in parent ? '"' + parent.name + '"' : parent.index
    }).inPoint, ${
      typeof layer.value === "string" ? '"' + layer.value + '"' : layer.value
    });

      layer.name;
    `
  };
  return asset;
}

export function getAssetForSetAttributeToParentAttribute(
  {
    layer,
    parent
  }: {
    layer:
      | { name: string; attribute: string }
      | { index: number; attribute: string };
    parent:
      | { name: string; attribute: string }
      | { index: number; attribute: string };
  },
  compName: string,
  parentCompName?: string
) {
  const asset = {
    type: "data",
    composition: compName,
    layerIndex: 1,
    property: "name",
    expression: `
      var comp;
      var parentComp;
      for (var i = 1; i <= app.project.numItems; i++) {
          if (app.project.item(i) instanceof CompItem) {
              if (app.project.item(i).name === "${compName}") {
                  comp = app.project.item(i);
                  ${parentCompName ? "if (parentComp) break;" : "break;"}
              } else if (${
                parentCompName
                  ? "app.project.item(i).name === " + '"' + parentCompName + '"'
                  : "false"
              }) {
                  parentComp = app.project.item(i);
                  if (comp) break;
              }
          }
      }
      if (!comp) throw new Error("Failed to find comp");
      ${
        parentCompName
          ? 'if (!parentComp) throw new Error("Failed to find parentComp");'
          : ""
      }

      comp.layer(${"name" in layer ? '"' + layer.name + '"' : layer.index}).${
      layer.attribute
    } = ${parentCompName ? "parentComp" : "comp"}.layer(${
      "name" in parent ? '"' + parent.name + '"' : parent.index
    }).${parent.attribute};

      layer.name;
    `
  };
  return asset;
}

export function getAssetForSetProperty(
  {
    layer
  }: {
    layer:
      | { name: string; property: string; value: string | number | boolean }
      | { index: number; property: string; value: string | number | boolean };
  },
  compName: string
) {
  const asset = {
    type: "data",
    composition: compName,
    layerIndex: 1,
    property: "name",
    expression: `
      var comp;
      for (var i = 1; i <= app.project.numItems; i++) {
          if ((app.project.item(i) instanceof CompItem) && (app.project.item(i).name === "${compName}")) {
              comp = app.project.item(i);
              break;
          }
      }

      comp.layer(${
        "name" in layer ? '"' + layer.name + '"' : layer.index
      }).property("${layer.property}").setValue(${
      typeof layer.value === "string" ? '"' + layer.value + '"' : layer.value
    });

      layer.name;
    `
  };
  return asset;
}

export function getAssetForSetAttribute(
  {
    layer
  }: {
    layer:
      | { name: string; attribute: string; value: string | number | boolean }
      | { index: number; attribute: string; value: string | number | boolean };
  },
  compName: string
) {
  const asset = {
    type: "data",
    composition: compName,
    layerIndex: 1,
    property: "name",
    expression: `
      var comp;
      for (var i = 1; i <= app.project.numItems; i++) {
          if ((app.project.item(i) instanceof CompItem) && (app.project.item(i).name === "${compName}")) {
              comp = app.project.item(i);
              break;
          }
      }

      comp.layer(${"name" in layer ? '"' + layer.name + '"' : layer.index}).${
      layer.attribute
    } = ${
      typeof layer.value === "string" ? '"' + layer.value + '"' : layer.value
    };

      layer.name;
    `
  };
  return asset;
}

export function getAssetForSetPropertyAtTime(
  {
    layer
  }: {
    layer:
      | {
          name: string;
          property: string;
          value: string | number | boolean;
          time: number;
        }
      | {
          index: number;
          property: string;
          value: string | number | boolean;
          time: number;
        };
  },
  compName: string
) {
  const asset = {
    type: "data",
    composition: compName,
    layerIndex: 1,
    property: "name",
    expression: `
      var comp;
      for (var i = 1; i <= app.project.numItems; i++) {
          if ((app.project.item(i) instanceof CompItem) && (app.project.item(i).name === "${compName}")) {
              comp = app.project.item(i);
              break;
          }
      }

      comp.layer(${
        "name" in layer ? '"' + layer.name + '"' : layer.index
      }).property("${layer.property}").setValueAtTime(${layer.time}, ${
      typeof layer.value === "string" ? '"' + layer.value + '"' : layer.value
    });

      layer.name
    `
  };
  return asset;
}

export function getAssetForDuplicateLayer(
  layer: string | number,
  compName: string,
  { newName }: { newName?: string } = {}
) {
  const asset = {
    type: "data",
    composition: compName,
    property: "name",
    layerIndex: 1,
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

      layer.name;
    `
  };
  return asset;
}

export function getAssetForMatchCompDurationToContents(compName: string) {
  const asset = {
    type: "data",
    composition: compName,
    layerIndex: 1,
    property: "name",
    expression: `
      ${getScriptForGetCompNamed(compName)}
      var maxOutPoint = 0;
      for (var i = 1; i <= comp.numLayers; i++){
        maxOutPoint = maxOutPoint > comp.layer(i).outPoint ? maxOutPoint : comp.layer(i).outPoint;
      }
      comp.duration = maxOutPoint;

      layer.name;
    `
  };
  return asset;
}

export function getScriptForGetCompNamed(compName: string) {
  return `
    var comp;
    for (var i = 1; i <= app.project.numItems; i++) {
        if ((app.project.item(i) instanceof CompItem) && (app.project.item(i).name === "${compName}")) {
            comp = app.project.item(i);
            break;
        }
    }
    if (!comp) throw new Error("Failed to find comp named ${compName}");
  `;
}

export function getAssetsForSetInOutToParent(
  {
    layer,
    parent
  }: {
    layer: { name: string } | { index: number };
    parent: { name: string } | { index: number };
  },
  compName: string,
  parentCompName?: string,
  isTextLayer?: boolean
) {
  const assets = [];
  assets.push(
    getAssetForSetAttributeToParentAttribute(
      {
        layer: { ...layer, attribute: isTextLayer ? "inPoint" : "startTime" },
        parent: { ...parent, attribute: isTextLayer ? "inPoint" : "startTime" }
      },
      compName,
      parentCompName
    )
  );
  assets.push(
    getAssetForSetAttributeToParentAttribute(
      {
        layer: { ...layer, attribute: "outPoint" },
        parent: { ...parent, attribute: "outPoint" }
      },
      compName,
      parentCompName
    )
  );
  return assets;
}

export function getAssetsForAddNextAudio(
  filePath: string,
  compName: string,
  delay: number,
  audioLevelVoice: number
) {
  const assets = [];

  // Add new audio layer containing fragment
  assets.push(
    getAssetForDuplicateLayer(1, compName, {
      newName: `audio.${filePath}`
    })
  );

  // Move new audio layer startTime to match the end of the previous audio layer
  assets.push(
    getAssetForSetAttributeToParentAttribute(
      {
        layer: {
          name: `audio.${filePath}`,
          attribute: "startTime"
        },
        parent: {
          index: 2,
          attribute: "outPoint"
        }
      },
      compName
    )
  );

  // Delay the start time by sectionDelay seconds if this is the first fragment in a section
  assets.push({
    type: "data",
    layerName: `audio.${filePath}`,
    property: "startTime",
    expression: `layer.startTime + ${delay}`
  });

  // Replace the audio source with the current fragment clip
  assets.push({
    src: getSrcForPath(filePath),
    layerName: `audio.${filePath}`,
    type: "audio"
  });

  // Update the outPoint of the audio layer to match the duration of the clip
  assets.push({
    type: "data",
    layerName: `audio.${filePath}`,
    property: "outPoint",
    expression: "layer.startTime + layer.source.duration"
  });

  // Set audio levels
  assets.push({
    type: "data",
    layerName: `audio.${filePath}`,
    property: "Audio Levels",
    value: [audioLevelVoice, audioLevelVoice]
  });

  return assets;
}

export function getAssetsForAddNextText(
  layer: { name: string; suffix: string },
  text: string,
  compName: string,
  parentCompName?: string
) {
  const assets = [];

  const dupeName = `${layer.name}.${layer.suffix}`;
  assets.push(
    getAssetForDuplicateLayer(layer.name, compName, {
      newName: dupeName
    })
  );
  assets.push({
    type: "data",
    composition: compName,
    layerName: dupeName,
    property: "Source Text",
    value: text
  });
  assets.push(
    ...getAssetsForSetInOutToParent(
      {
        layer: {
          name: dupeName
        },
        parent: {
          name: `audio.${layer.suffix}`
        }
      },
      compName,
      parentCompName,
      true
    )
  );

  return assets;
}
