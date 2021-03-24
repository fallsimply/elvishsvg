(() => {
  // src/lib.ts
  var validParents = ["FRAME", "GROUP", "COMPONENT_SET"];
  async function iter(frame) {
    if (validParents.indexOf(frame.type) < 0)
      return;
    let icons = frame.findAll((node) => {
      if (!("children" in node) || node.children.filter((e) => e.type == "FRAME" || e.type == "COMPONENT").length > 0)
        return false;
      let prefix = "", prnt = node.parent;
      while (prnt !== frame) {
        prefix = `${prnt.name}/${prefix}`;
        prnt = prnt.parent;
      }
      node.setPluginData("prefix", prefix);
      return node.type === "FRAME" || node.type === "COMPONENT";
    });
    frame.setRelaunchData({export: ""});
    let svgs = {};
    for (const icon of icons) {
      svgs[icon.getPluginData("prefix") + icon.name] = await icon.exportAsync({format: "SVG"});
    }
    return svgs;
  }

  // src/code.ts
  var showSelectToast = () => figma.notify("Please select a Frame, Group, or Component Set");
  if (figma.currentPage.selection.length <= 0)
    showSelectToast();
  else {
    figma.showUI(__html__, {width: 400, height: 430});
    figma.ui.postMessage({type: "useUI", payload: figma.command});
    figma.ui.onmessage = (msg) => {
      switch (msg.type) {
        case "generate":
          switch (figma.currentPage.selection[0].type) {
            case "FRAME":
            case "GROUP":
            case "COMPONENT_SET":
              let parent = figma.currentPage.selection[0];
              let icons = iter(parent);
              icons.then((val) => figma.ui.postMessage({type: "decode", payload: val, parent, test: "hello"}));
              break;
            default:
              showSelectToast();
          }
          break;
        case "close":
          figma.closePlugin();
      }
      figma.command;
    };
  }
})();
