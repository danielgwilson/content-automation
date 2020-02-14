//@include "/Users/danielgwilson/local_git/reddit-youtube-video-bot/build/resources/ae-scripts/ae-util.js"

function createCommentContentComp(
  refComp: CompItem,
  newCompName: string,
  section: import("../types/post").IPostSection,
  audioLevelVoice: number,
  layerOffset: number = 0
) {
  // Create new comment content comp
  const comp = app.project.items.addComp(
    newCompName,
    refComp.width,
    refComp.height,
    refComp.pixelAspect,
    refComp.duration,
    refComp.frameRate
  );

  // Copy content layers from refComp
  for (let i = refComp.numLayers; i > 0; i--) {
    const layer = refComp.layer(i);
    if (layer.name === "comment-bg") continue;
    copyLayerToComp({ index: i, comp: refComp }, { comp });
  }
  const nullLayer = comp.layer("null-parent");

  // Voice-overs
  const voLayers: AVLayer[] = [];
  for (let i = 0; i < section.fragments.length; i++) {
    const fragment = section.fragments[i];

    // Add voice-over audio file
    const voLayer = addLayer(importFootage(fragment.audio.filePath), comp, {
      name: `audio.${fragment.audio.filePath}`
    });
    voLayer.startTime = i === 0 ? 0 : comp.layer(2).outPoint;
    voLayer.audio.audioLevels.setValue([audioLevelVoice, audioLevelVoice]);
    voLayers.push(voLayer);
  }
  const voOutPoint = voLayers[voLayers.length - 1].outPoint;

  // Move layers over if child comment / reply
  if (layerOffset) {
    // Resize child comment text box to account for less space on the right side
    const commentTextLayer = comp.layer("comment-text") as TextLayer;
    const commentTextDoc = commentTextLayer.text.sourceText.value as any;
    commentTextDoc.boxTextSize = [
      commentTextDoc.boxTextSize[0] -
        layerOffset * (nullLayer.position.value as number[])[0],
      commentTextDoc.boxTextSize[1]
    ];
    commentTextLayer.text.sourceText.setValue(commentTextDoc);
  }

  // Update comment text to show current fragment
  const textsWithPriors: string[] = [];
  const voInPoints: number[] = [];
  for (let i = 0; i < section.fragments.length; i++) {
    textsWithPriors.push(section.fragments[i].textWithPriors);
    voInPoints.push(voLayers[i].inPoint);
  }
  updateTextLayerAtTimes(
    comp.layer("comment-text") as TextLayer,
    textsWithPriors,
    voInPoints
  );

  // Update user text
  updateTextLayerAtTime(
    comp.layer("user-text") as TextLayer,
    section.author,
    voLayers[0].inPoint
  );

  // Update score text
  let scoreText = "";
  if (section.score < 999) scoreText = `${section.score} points`;
  else if (section.score < 99999)
    scoreText = `${Math.round(section.score / 100) / 10}k points`;
  else scoreText = `${Math.round(section.score / 1000)}k points`;
  updateTextLayerAtTime(
    comp.layer("score-text") as TextLayer,
    scoreText,
    voLayers[0].inPoint
  );

  handleChildren(
    section.children,
    comp,
    refComp,
    newCompName,
    audioLevelVoice,
    layerOffset,
    voOutPoint
  );

  // Update collapse comment bar size
  const collapseCommentBarLayer = comp.layer("collapse-comment-bar") as any;
  const collapseCommentBarSize = collapseCommentBarLayer
    .content("Rectangle 1")
    .content("Rectangle Path 1").size;
  collapseCommentBarSize.expression = `
    var w = 5;
    var contentCompName = "${comp.name}";
    var timeDiff = 0;

    // If child / reply sub comp is active, size based on its collapse comment bar
    if (thisComp.layer(1).source.numLayers && time > thisComp.layer(1).inPoint) {
      contentCompName = thisComp.layer(1).name;
      timeDiff = thisComp.layer(1).startTime;
    }

    var contentComp = comp(contentCompName);
    var commentTextHeight = contentComp.layer("comment-text").sourceRectAtTime(time - timeDiff, false).height;
    var yDiff = thisLayer.position[1] - thisComp.layer("comment-text").position[1];
    var nullYDiff = contentComp.layer("null-parent").position[1] - thisComp.layer("null-parent").position[1];
    var h = commentTextHeight + nullYDiff - yDiff;
    [w, h];
  `;

  // Update UI visibility
  // Set inPoint and outPoint for all relevant layers
  // Also parent the layers to the null object for alignment
  for (let layerName of [
    "comment-text",
    "user-text",
    "score-text",
    "upvote-arrow",
    "downvote-arrow",
    "collapse-comment-bar",
    "null-parent"
  ]) {
    const layer = comp.layer(layerName) as Layer;
    if (!layer)
      throw new Error(
        `Failed to find layer named "${layerName}" in comp "${comp.name}"`
      );
    layer.inPoint = voLayers[0].inPoint;
    layer.outPoint = comp.layer(1).outPoint;
    if (layerName !== "null-parent") layer.parent = nullLayer;
  }

  // Set the outPoint of the comment comp to match the length of the contents
  comp.duration = comp.layer(1).outPoint;

  return comp;
}

// Handle reply comments
function handleChildren(
  children: import("../types/post").IPostSection[],
  comp: CompItem,
  refComp: CompItem,
  newCompName: string,
  audioLevelVoice: number,
  layerOffset: number,
  voOutPoint: number
) {
  for (let i = 0; i < children.length; i++) {
    const child = children[i];

    // Create reply subcomp
    const childComp = createCommentContentComp(
      refComp,
      `${newCompName}.${i}`,
      child,
      audioLevelVoice,
      layerOffset + 1
    );
    comp.layers.add(childComp);
    const childLayer = comp.layer(1);
    childLayer.startTime = voOutPoint;

    // Reposition subcomp null object
    const nullLayer = comp.layer("null-parent");
    const childNullLayer = childComp.layer("null-parent");
    const upvoteArrowLayer = comp.layer("upvote-arrow") as TextLayer;
    const commentTextLayer =
      i === 0
        ? (comp.layer("comment-text") as TextLayer)
        : (getComp(`${newCompName}.${i - 1}`).layer(
            "comment-text"
          ) as TextLayer);
    const xPos = (upvoteArrowLayer.position.value as number[])[0]; // where layerOffset represents rank of subcomment
    const yPos =
      (commentTextLayer.position.value as number[])[1] +
      commentTextLayer.sourceRectAtTime(voOutPoint, false).height +
      0.5 *
        ((commentTextLayer.position.value as number[])[1] -
          (nullLayer.position.value as number[])[1]);
    childNullLayer.position.expression = `
      var parentComp = comp("${comp.name}");
      var parentNullLayer = parentComp.layer("null-parent");
      [parentNullLayer.position[0] + ${xPos} - thisLayer.position.valueAtTime(0)[0], parentNullLayer.position[1] + ${yPos} - thisLayer.position.valueAtTime(0)[1]];
    `;
  }
}
