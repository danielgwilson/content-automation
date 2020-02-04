var comp;
for (var i = 1; i <= app.project.numItems; i++) {
    if ((app.project.item(i) instanceof CompItem) && (app.project.item(i).name === 'reddit-template')) {
        comp = app.project.item(i);
        break;
    }
}
comp.duration = comp.layer(1).outPoint;