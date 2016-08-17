'use babel';

import { CompositeDisposable } from 'atom';

function forEach(dict, f) {
    for (key in dict) {
        if (dict.hasOwnProperty(key))
            f(key, dict[key]);
    }
}

export default {

  subscriptions: null,

  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    atom.workspace.observePanes(pane => this.initPane(pane));
    forEach(atom.workspace.panelContainers,
      (name, panelContainer) => {
        this.subscriptions.add(
          panelContainer.onDidAddPanel(
            panelEvent => {
              this.initPanel(panelEvent.panel);
            }));

        panelContainer.getPanels().forEach(
          panel => {
            this.initPanel(panel);
          });
      }
    );
  },

  initPane(pane) {
    let view = atom.views.getView(pane);
    this.subscriptions.add(
      view.addEventListener('mouseenter',
        () => pane.activate()));
  },

  initPanel(panel) {
    let view = atom.views.getView(panel);
    if (!view) return;  // TODO: does this even happen?
    this.subscriptions.add(
      view.addEventListener('mouseenter',
        () => panel.item.focus()));
  },

  deactivate() {
    this.subscriptions.dispose();
  },
};
