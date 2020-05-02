/// <reference types="types-for-adobe/aftereffects/2018"/>
//@include "/Users/danielgwilson/local_git/reddit-youtube-video-bot/lib/resources/ae-scripts/ae-util.js"
//@include "/Users/danielgwilson/local_git/reddit-youtube-video-bot/lib/resources/ae-scripts/ae-section-comment-util.js"

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
  const thisComp = app.project.items.addComp(
    `${compName}.${section.fragments[0].audio.fileName}`,
    refComp.width,
    refComp.height,
    refComp.pixelAspect,
    refComp.duration,
    refComp.frameRate
  );

  // Copy content layers from refComp
  for (let i = refComp.numLayers; i > 0; i--) {
    copyLayerToComp({ index: i, comp: refComp }, { comp: thisComp });
  }

  // Add comment contents
  const contentComp = createCommentContentComp(
    getComp(`${compName}.content`),
    `${compName}.content.${section.fragments[0].audio.fileName}.0`,
    section,
    audioLevelVoice
  );
  const contentCompLayer = thisComp.layers.add(contentComp.comp);
  contentCompLayer.anchorPoint.setValue([0, 0]);

  // Set content comp position over time based on background size
  function updateContentCompPosition() {
    for (let keyframe of contentComp.keyframes) {
      // Update BG y position as a function of new height (keep bottom text on screen)
      const bgLayer = contentComp.comp.layer("comment-bg") as ShapeLayer;
      const bgHeight: number = (bgLayer as any)
        .content("Rectangle 1")
        .content("Rectangle Path 1")
        .size.valueAtTime(keyframe.time, false)[1];

      const xPos = Math.round((thisComp.width - contentComp.comp.width) / 2);
      const yPos0 = Math.round((thisComp.height * 0.444) / 2);

      const distFromBottom = thisComp.height - (bgHeight + yPos0);
      const yNewPos = Math.min(yPos0, distFromBottom);

      contentCompLayer.position.setValueAtTime(keyframe.time, [xPos, yNewPos]);
      contentCompLayer.position.setInterpolationTypeAtKey(
        contentCompLayer.position.nearestKeyIndex(keyframe.time),
        KeyframeInterpolationType.HOLD
      );
    }
  }
  updateContentCompPosition();

  // Update durations of all content comps based on root parent length
  // Basically, make sure all comments stay visible until all replies complete
  function updateDurations(comp: CompItem, duration: number) {
    for (let i = 1; i <= comp.numLayers; i++) {
      const layer = comp.layer(i);
      if (
        layer instanceof AVLayer &&
        (layer as AVLayer).source instanceof CompItem
      ) {
        const subCompLayer = layer as AVLayer;
        const subDuration = Math.max(0, duration - subCompLayer.startTime);
        const subComp = getComp(layer.name);

        subComp.duration = subDuration;
        subCompLayer.outPoint = duration;
        updateDurations(subComp, subDuration);
      } else if (!(layer instanceof AVLayer) || !layer.hasAudio) {
        layer.outPoint = duration;
      }
    }
  }
  updateDurations(contentComp.comp, contentComp.comp.duration);

  const transitionLayer = addTransition(thisComp, thisComp.layer(1));

  // Set the outPoint of the comment comp to match the length of the contents
  thisComp.duration = transitionLayer.outPoint;
})();
