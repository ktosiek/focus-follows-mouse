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

function log() {
  if (atom.inDevMode()) {
    var args = Array.from(arguments);
    args.unshift("focus-follows-mouse:");
    console.log.apply(console, args);
  }
}

function warn() {
  var args = Array.from(arguments);
  args.unshift("focus-follows-mouse:");
  console.warn.apply(console, args);
}

class Debouncer {
  constructor(delay) {
    this._timeout = null;
    this.delay = delay;
  }

  run(func) {
    clearTimeout(this._timeout);
    this._timeout = setTimeout(func, this.delay);
  }

  dispose() {
    clearTimeout(this._timeout);
  }
}

export default {

  config: {
    delay: {
      type: 'integer',
      default: 250,
      description: 'Delay between hovering over a pane \
                    and the focus getting changed.',
      minimum: 0,
    },
  },

  subscriptions: null,
  debouncer: null,

  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    this.debouncer = this.subscribe(
      new Debouncer(atom.config.get('focus-follows-mouse.delay')));
    atom.config.onDidChange('focus-follows-mouse.delay', () => {
      this.deactivate();
      this.activate();
    });

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
    console.assert(
      Disposable.isDisposable(disposable),
      "Argument to subscribe is not disposable", disposable);
    this.subscriptions.add(disposable);
    return disposable;
  },

  initPane(pane) {
    let view = atom.views.getView(pane);
    log('attaching to pane', pane, 'view:', view);
    this.subscribe(
      addEventListener(view, 'mouseenter',
        () => this.debouncer.run(() => {
          log('focusing pane', pane, 'focused:', pane.focused);
          if (!pane.focused) pane.activate();
        })
      )
    );
  },

  initPanel(panel) {
    let view = atom.views.getView(panel);
    log('attaching to panel', panel, 'view:', view);
    if (!view) return;  // TODO: does this even happen?
    this.subscribe(addEventListener(view, 'mouseenter',
      () => this.debouncer.run(() => {
        let item = panel.getItem();
        if (typeof item.focus == 'function') {
          log('focusing panel', panel);
          item.focus();
        } else {
          warn('cannot focus panel', panel, ': no "focus" function');
        }
      })));
  },

  deactivate() {
    this.subscriptions.dispose();
  },
};
