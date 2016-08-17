'use babel';

import FocusFollowsMouseView from './focus-follows-mouse-view';
import { CompositeDisposable } from 'atom';

export default {

  focusFollowsMouseView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.focusFollowsMouseView = new FocusFollowsMouseView(state.focusFollowsMouseViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.focusFollowsMouseView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'focus-follows-mouse:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.focusFollowsMouseView.destroy();
  },

  serialize() {
    return {
      focusFollowsMouseViewState: this.focusFollowsMouseView.serialize()
    };
  },

  toggle() {
    console.log('FocusFollowsMouse was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
