/// <reference types="types-for-adobe/aftereffects/2018"/>
//@include "/Users/danielgwilson/local_git/reddit-youtube-video-bot/build/resources/ae-scripts/ae-util.js"

(() => {
  // Check if required parameters are present
  if (
    !BG_MUSIC_PARAMS.compName ||
    !BG_MUSIC_PARAMS.filePath ||
    !BG_MUSIC_PARAMS.audioLevel
  )
    throw new Error("Script missing required parameter.");

  const { compName, filePath, audioLevel } = BG_MUSIC_PARAMS;

  const comp = getComp(compName);

  // Add voiceover audio file
  const bgMusicLayer = addLayer(importFootage(filePath), comp, {
    name: "audio.bg-music"
  });
  bgMusicLayer.audio.audioLevels.setValue([audioLevel, audioLevel]);
  bgMusicLayer.timeRemapEnabled = true;
  bgMusicLayer.timeRemap.expression = "loopOut()";
  bgMusicLayer.outPoint = comp.layer(1).outPoint;
})();
