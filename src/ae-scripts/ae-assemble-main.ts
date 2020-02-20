/// <reference types="types-for-adobe/aftereffects/2018"/>
//@include "/Users/danielgwilson/local_git/reddit-youtube-video-bot/build/resources/ae-scripts/ae-util.js"

(() => {
  // Check if required parameters are present
  if (!ASSEMBLE_MAIN_PARAMS.compName || !ASSEMBLE_MAIN_PARAMS.subCompNames)
    throw new Error("Script missing required parameter.");

  const { compName, subCompNames } = ASSEMBLE_MAIN_PARAMS;

  const comp = getComp(compName);
  for (let i = 0; i < subCompNames.length; i++) {
    const subComp = getComp(subCompNames[i]);
    const layer = comp.layers.add(subComp);
    layer.startTime = i === 0 ? 0 : comp.layer(2).outPoint;
  }
  comp.duration = comp.layer(1).outPoint;
})();
