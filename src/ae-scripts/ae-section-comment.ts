/// <reference types="types-for-adobe/aftereffects/2018"/>
//@include "/Users/danielgwilson/local_git/reddit-youtube-video-bot/build/resources/ae-scripts/ae-util.js"
//@include "/Users/danielgwilson/local_git/reddit-youtube-video-bot/build/resources/ae-scripts/ae-section-comment-util.js"

(() => {
  // Check if required parameters are present
  if (
    !SECTION_COMMENT_PARAMS.compName ||
    !SECTION_COMMENT_PARAMS.section ||
    !SECTION_COMMENT_PARAMS.audioLevelVoice
  )
    throw new Error("Script missing required parameter.");

  const { compName, section, audioLevelVoice } = SECTION_COMMENT_PARAMS;

  const refComp = getComp(compName);
  const comp = app.project.items.addComp(
    `${compName}.${section.fragments[0].audio.fileName}`,
    refComp.width,
    refComp.height,
    refComp.pixelAspect,
    refComp.duration,
    refComp.frameRate
  );

  // Copy content layers from refComp
  for (let i = refComp.numLayers; i > 0; i--) {
    copyLayerToComp({ index: i, comp: refComp }, { comp });
  }

  // Get background layer to use as a position reference
  const bgLayer = comp.layer("comment-bg");

  // Add comment contents and position based on bg layer
  const contentComp = createCommentContentComp(
    getComp(`${compName}.content`),
    `${compName}.content.${section.fragments[0].audio.fileName}.0`,
    section,
    audioLevelVoice
  );
  const contentCompLayer = comp.layers.add(contentComp.comp);
  contentCompLayer.anchorPoint.setValue([0, 0]);
  contentCompLayer.position.setValue(bgLayer.position.value);

  // Update bg size to contain contents
  function updateBGSize() {
    const bgSize = (bgLayer as any)
      .content("Rectangle 1")
      .content("Rectangle Path 1").size;
    const yPos = (bgLayer.position.value as number[])[1];
    const bgWidth = 1536;
    for (let keyframe of contentComp.keyframes) {
      const bgHeight = keyframe.height - yPos;
      bgSize.setValueAtTime(keyframe.time, [bgWidth, bgHeight]);
    }
  }
  updateBGSize();

  // Add transition clip at outPoint of last voice-over audio clip
  const transitionLayer = addLayer(getFootageItem("transition-1s.mp4"), comp, {
    name: "transition"
  });
  transitionLayer.startTime = comp.layer(2).outPoint;

  // Update UI visibility
  // Set inPoint and outPoint for all relevant layers
  // Also parent the layers to the null object for alignment
  const nullLayer = comp.layer("null-parent");
  for (let layerName of ["comment-bg", "null-parent"]) {
    const layer = comp.layer(layerName);
    if (!layer)
      throw new Error(
        `Failed to find layer named "${layerName}" in comp "${comp.name}"`
      );
    layer.inPoint = 0;
    layer.outPoint = comp.layer(1).outPoint;
  }
  for (let i = 1; i <= comp.numLayers; i++) {
    const layer = comp.layer(i);
    if (layer.name !== "null-parent") layer.parent = nullLayer;
  }

  // Set null object expressions to move nulls
  comp.layer("null-parent").position.expression = `
    var bgHeight = thisComp.layer("comment-bg").content("Rectangle 1").content("Rectangle Path 1").size[1];
    var dBot = 1080 - (242 + bgHeight);
    [position[0], Math.min(242, dBot)]
  `;

  // Set the outPoint of the comment comp to match the length of the contents
  comp.duration = transitionLayer.outPoint;
})();
