/// <reference types="types-for-adobe/aftereffects/2018"/>
//@include "/Users/danielgwilson/local_git/reddit-youtube-video-bot/lib/resources/ae-scripts/ae-util.js"

(() => {
  // Check if required parameters are present
  if (!BG_PARAMS.compName || !BG_PARAMS.filePath || !BG_PARAMS.audioLevel)
    throw new Error("Script missing required parameter.");

  const { compName, filePath, audioLevel, videoPath } = BG_PARAMS;

  const comp = getComp(compName);

  // Add voiceover audio file
  const bgMusicLayer = addLayer(importFootage(filePath), comp, {
    name: "audio.bg-music"
  });
  bgMusicLayer.moveToEnd();
  bgMusicLayer.audio.audioLevels.setValue([audioLevel, audioLevel]);
  bgMusicLayer.timeRemapEnabled = true;
  bgMusicLayer.timeRemap.expression = "loopOut()";
  bgMusicLayer.outPoint = comp.duration;

  // Background video
  if (videoPath) {
    const bgVideoLayer = addLayer(importFootage(videoPath), comp, {
      name: `bg-video`
    });
    bgVideoLayer.moveToEnd();
    bgVideoLayer.timeRemapEnabled = true;
    bgVideoLayer.timeRemap.expression = "loopOut()";
    bgVideoLayer.outPoint = comp.duration;
  } else {
    // Add BG solid if no BG video
    // TODO: handle other color profiles
    const bgSolidLayer = comp.layers.addSolid(
      [238 / 255, 238 / 255, 238 / 255],
      "bg-solid",
      1920,
      1080,
      1.0
    );
    bgSolidLayer.moveToEnd();
  }
})();
