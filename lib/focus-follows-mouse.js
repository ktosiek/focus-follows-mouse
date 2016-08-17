'use babel';

import { CompositeDisposable, Disposable } from 'atom';

function forEach(dict, f) {
    for (key in dict) {
        if (dict.hasOwnProperty(key))
            f(key, dict[key]);
    }
}

function addEventListener(view, event, func) {
  view.addEventListener(event, func);
  return new Disposable(
    () => view.removeEventListener(event, func));
}

export default {

  subscriptions: null,

  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    this.subscribe(
      atom.workspace.observePanes(pane => this.initPane(pane)));
    forEach(atom.workspace.panelContainers,
      (name, panelContainer) => {
        this.subscribe(
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

  subscribe(disposable) {
    if (!disposable) debugger;
    this.subscriptions.add(disposable);
  },

  initPane(pane) {
    let view = atom.views.getView(pane);
    this.subscribe(
      addEventListener(view, 'mouseenter',
        () => pane.activate()));
  },

  initPanel(panel) {
    let view = atom.views.getView(panel);
    if (!view) return;  // TODO: does this even happen?
    this.subscribe(addEventListener(view, 'mouseenter',
      () => panel.item.focus()));
  },

  deactivate() {
    this.subscriptions.dispose();
  },
};