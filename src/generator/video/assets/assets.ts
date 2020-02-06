import { IPostSection } from "../../../types/post";

const srcPrefix = "file://";
const SECTION_DELAY = 1;

export function getAssetsForSection(section: IPostSection, compName: string) {
  return section.type === "title"
    ? getAssetsForSectionTitle(section, compName)
    : getAssetsForSectionComment(section, compName);
}

function getAssetsForSectionTitle(section: IPostSection, compName: string) {
  const assets = [];

  // Add title audio
  assets.push({
    src: `${srcPrefix}${section.fragments[0].audio.filePath}`,
    layerName: "audio-ref",
    type: "audio"
  });
  assets.push({
    type: "data",
    layerName: "audio-ref",
    property: "outPoint",
    expression: "layer.startTime + layer.source.duration"
  });

  // Update title comp outPoint
  assets.push(
    getAssetForSetAttributeToParentAttribute(
      {
        layer: { name: `${compName}.title-comp`, attribute: "outPoint" },
        parent: { name: "audio-ref", attribute: "outPoint" }
      },
      compName
    )
  );

  // Update title text
  assets.push({
    type: "data",
    composition: `${compName}.title-comp`,
    layerName: "title-text",
    property: "Source Text",
    value: section.fragments[0].text
  });

  // Update subreddit name
  if (!section.subredditName) throw new Error("subredditName undefined");
  assets.push({
    type: "data",
    composition: `${compName}.title-comp`,
    layerName: "subreddit-text",
    property: "Source Text",
    value: "r/" + section.subredditName
  });

  // Update author name
  if (!section.author) throw new Error("author undefined");
  assets.push({
    type: "data",
    composition: `${compName}.title-comp`,
    layerName: "user-text",
    property: "Source Text",
    value: "u/" + section.author
  });

  // Update number of comments
  if (!section.numComments) throw new Error("numComments undefined");
  assets.push({
    type: "data",
    composition: `${compName}.title-comp`,
    layerName: "num-comments-text",
    property: "Source Text",
    value:
      section.numComments > 999
        ? `${Math.round(section.numComments / 100) / 10}k Comments`
        : `${section.numComments} Comments`
  });

  // Update score
  if (!section.score) throw new Error("score undefined");
  assets.push({
    type: "data",
    composition: `${compName}.title-comp`,
    layerName: "score-text",
    property: "Source Text",
    value:
      section.score > 999
        ? `${Math.round(section.score / 100) / 10}k`
        : `${section.score}`
  });

  // Update upvote ratio
  // if (!section.upvoteRatio) throw new Error("upvoteRatio undefined");
  // assets.push(
  //   getAssetForSetProperty(
  //     {
  //       layer: {
  //         name: "pct-upvoted-text",
  //         property: "text.sourceText",
  //         value: `${Math.round(section.upvoteRatio * 100)}% Upvoted`
  //       }
  //     },
  //     "reddit-template-01.title-comp"
  //   )
  // );

  // Set the inPoint of the comment comp to right after the title comp finishes
  assets.push(
    getAssetForSetAttributeToParentAttribute(
      {
        layer: { name: `${compName}.comment-comp`, attribute: "inPoint" },
        parent: { name: `${compName}.title-comp`, attribute: "outPoint" }
      },
      compName
    )
  );
  // Delay the inPoint by SECTION_DELAY seconds if this is the first fragment in a section
  assets.push({
    type: "data",
    layerName: `${compName}.comment-comp`,
    property: "inPoint",
    expression: `layer.inPoint + ${SECTION_DELAY}`
  });

  return assets;
}

function getAssetsForSectionComment(section: IPostSection, compName: string) {
  const assets: any[] = [];

  for (let [i, fragment] of section.fragments.entries()) {
    const sectionDelay = i === 0 ? SECTION_DELAY : 0;

    // Add new audio layer containing fragment
    assets.push(
      ...getAssetsForAddNextAudio(
        fragment.audio.filePath,
        compName,
        sectionDelay
      )
    );

    // Update user text
    assets.push(
      ...getAssetsForAddNextText(
        { name: "user-text", suffix: fragment.audio.filePath },
        section.author,
        `${compName}.comment-comp`,
        compName
      )
    );

    // Update score text
    assets.push(
      ...getAssetsForAddNextText(
        { name: "score-text", suffix: fragment.audio.filePath },
        section.score > 999
          ? `${Math.round(section.score / 100) / 10}k`
          : `${section.score} points`,
        `${compName}.comment-comp`,
        compName
      )
    );

    // Update comment text to show current fragment
    assets.push(
      ...getAssetsForAddNextText(
        { name: "comment-text", suffix: fragment.audio.filePath },
        fragment.textWithPriors,
        `${compName}.comment-comp`,
        compName
      )
    );

    // Set arrows inPoint and outPoint
    assets.push(
      getAssetForDuplicateLayer("upvote-arrow", `${compName}.comment-comp`, {
        newName: `upvote-arrow.${fragment.audio.filePath}`
      })
    );
    assets.push(
      ...getAssetsForSetInOutToParent(
        {
          layer: {
            name: `upvote-arrow.${fragment.audio.filePath}`
          },
          parent: {
            name: `audio.${fragment.audio.filePath}`
          }
        },
        `${compName}.comment-comp`,
        compName
      )
    );
    assets.push(
      getAssetForDuplicateLayer("downvote-arrow", `${compName}.comment-comp`, {
        newName: `downvote-arrow.${fragment.audio.filePath}`
      })
    );
    assets.push(
      ...getAssetsForSetInOutToParent(
        {
          layer: {
            name: `downvote-arrow.${fragment.audio.filePath}`
          },
          parent: {
            name: `audio.${fragment.audio.filePath}`
          }
        },
        `${compName}.comment-comp`,
        compName
      )
    );

    // Set background inPoint and outPoint
    assets.push(
      getAssetForDuplicateLayer("comment-bg", `${compName}.comment-comp`, {
        newName: `comment-bg.${fragment.audio.filePath}`
      })
    );
    assets.push(
      ...getAssetsForSetInOutToParent(
        {
          layer: {
            name: `comment-bg.${fragment.audio.filePath}`
          },
          parent: {
            name: `audio.${fragment.audio.filePath}`
          }
        },
        `${compName}.comment-comp`,
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
              if (app.project.item(i).name === ${compName}) {
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

export function getAssetForMatchCompLengthToContents(compName: string) {
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

function getScriptForGetCompNamed(compName: string) {
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

function getAssetsForSetInOutToParent(
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

function getAssetsForAddNextAudio(
  filePath: string,
  compName: string,
  delay: number
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
    src: `${srcPrefix}${filePath}`,
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

  return assets;
}

function getAssetsForAddNextText(
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
