/// <reference types="types-for-adobe/aftereffects/2018"/>
//@include "/Users/danielgwilson/local_git/content-automation/lib/resources/ae-scripts/ae-util.js"

(() => {
  const compName = NX.get('compName');
  if (!compName)
    throw new Error(
      `Script 'ae-bg.jsx' missing required parameter: 'compName'.`
    );
  const filePath = NX.get('filePath');
  if (!filePath)
    throw new Error(
      `Script 'ae-bg.jsx' missing required parameter: 'filePath'.`
    );
  const audioLevel = NX.get('audioLevel');
  if (!audioLevel)
    throw new Error(
      `Script 'ae-bg.jsx' missing required parameter: 'audioLevel'.`
    );
  const videoPath = NX.get('videoPath');
  // if (!videoPath)
  //   throw new Error(
  //     `Script 'ae-bg.jsx' missing required parameter: 'videoPath'.`
  //   );

  const comp = getComp(compName);

  // Add voiceover audio file
  const bgMusicLayer = addLayer(importFootage(filePath), comp, {
    name: 'audio.bg-music',
  });
  bgMusicLayer.moveToEnd();
  bgMusicLayer.audio.audioLevels.setValue([audioLevel, audioLevel]);
  bgMusicLayer.timeRemapEnabled = true;
  bgMusicLayer.timeRemap.expression = 'loopOut()';
  bgMusicLayer.outPoint = comp.duration;

  // Background video
  if (videoPath) {
    const bgVideoLayer = addLayer(importFootage(videoPath), comp, {
      name: `bg-video`,
    });
    bgVideoLayer.moveToEnd();
    bgVideoLayer.timeRemapEnabled = true;
    bgVideoLayer.timeRemap.expression = 'loopOut()';
    bgVideoLayer.outPoint = comp.duration;
  } else {
    // Add BG solid if no BG video
    // TODO: handle other color profiles
    const bgSolidLayer = comp.layers.addSolid(
      // [238 / 255, 238 / 255, 238 / 255],
      [22 / 255, 22 / 255, 23 / 255],
      'bg-solid',
      comp.width,
      comp.height,
      1.0
    );
    bgSolidLayer.moveToEnd();
  }
})();
