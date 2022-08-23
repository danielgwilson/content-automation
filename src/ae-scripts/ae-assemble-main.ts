/// <reference types="types-for-adobe/aftereffects/2018"/>
//@include "/Users/danielgwilson/local_git/content-automation/lib/resources/ae-scripts/ae-util.js"

(() => {
  const compName = NX.get('compName');
  if (!compName)
    throw new Error(
      `Script 'ae-assemble-main.jsx' missing required parameter: 'compName'.`
    );
  const subCompNames = NX.get('subCompNames');
  if (!subCompNames)
    throw new Error(
      `Script 'ae-assemble-main.jsx' missing required parameter: 'subCompNames'.`
    );

  const comp = getComp(compName);
  for (let i = 0; i < subCompNames.length; i++) {
    const subComp = getComp(subCompNames[i]);
    const layer = comp.layers.add(subComp);
    layer.startTime = i === 0 ? 0 : comp.layer(2).outPoint;
  }
  comp.duration = comp.layer(1).outPoint;
})();
