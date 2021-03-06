import { UIComponent } from '@/UIComponent';
import { makeElement } from '@/util/dom';

import './Frame.scss';

export default class Frame<E = {}> extends UIComponent<E, HTMLIFrameElement> {
  private cleanup: null | (() => void) = null;

  public constructor(onload: (doc: Document) => () => void) {
    super(makeElement('iframe', {
      src: window.URL.createObjectURL(new Blob([''], { type: 'text/html' })),
      width: '100%',
      height: '100%',
      frameBorder: '0',
      onload: () => {
        this.cleanup = onload(this.el.contentDocument!);
      },
      tabIndex: -1
    }));

    this.destroy.do(this.cleanup);
  }
}