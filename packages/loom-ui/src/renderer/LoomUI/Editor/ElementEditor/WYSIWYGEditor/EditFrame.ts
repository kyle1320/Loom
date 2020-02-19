import WYSIWYGEditor, { WYSIWYGNode } from '.';
import { UIComponent } from '../../../UIComponent';
import { makeElement } from '../../../util/dom';

import './EditFrame.scss';

export default class EditFrame extends UIComponent<{}, HTMLElement> {
  private node: WYSIWYGNode | null = null;

  private margin: HTMLElement;
  private border: HTMLElement;
  private padding: HTMLElement;

  public constructor(
    editor: WYSIWYGEditor
  ) {
    super(null!);

    this.el = makeElement('div', { className: 'edit-frame' },
      this.margin = makeElement('div', { className: 'edit-frame__margin' }),
      this.border = makeElement('div', { className: 'edit-frame__border' },
        this.padding = makeElement('div', { className: 'edit-frame__padding' })
      )
    );

    editor.on('select', node => {
      if (!this.node) {
        this.node = node;
        this.refresh();
      } else {
        this.node = node;
      }
    });
  }

  private refresh = (): void => {
    if (!this.node) return;

    function getValue(s: string): number {
      return +s.replace(/px$/, '') || 0
    }

    type Values = { top: number; right: number; bottom: number; left: number };
    function getValues(
      top: string, right: string, bottom: string, left: string
    ): Values {
      return {
        top: getValue(top),
        right: getValue(right),
        bottom: getValue(bottom),
        left: getValue(left)
      }
    }

    function setBorders(style: CSSStyleDeclaration, values: Values): void {
      style.borderWidth =
        `${values.top}px ${values.right}px ${values.bottom}px ${values.left}px`
      style.borderImageSlice =
        `${values.top} ${values.right} ${values.bottom} ${values.left}`;
    }

    const n = this.node?.getEl();
    const el = n
      ? n.nodeType === 3 ? n.parentElement : n as unknown as HTMLElement
      : null;
    if (el) {
      const bounds = el.getBoundingClientRect();

      this.el.style.display = 'block';
      this.el.style.top = bounds.top + 'px';
      this.el.style.left = bounds.left + 'px';
      this.el.style.width = bounds.width + 'px';
      this.el.style.height = bounds.height + 'px';

      const style = window.getComputedStyle(el);

      const margin = getValues(
        style.marginTop, style.marginRight,
        style.marginBottom, style.marginLeft
      );
      this.margin.style.top = -Math.max(0, margin.top) + 'px';
      this.margin.style.right = -Math.max(0, margin.right) + 'px';
      this.margin.style.bottom = -Math.max(0, margin.bottom) + 'px';
      this.margin.style.left = -Math.max(0, margin.left) + 'px';

      setBorders(this.margin.style, margin);
      setBorders(this.border.style, getValues(
        style.borderTopWidth, style.borderRightWidth,
        style.borderBottomWidth, style.borderLeftWidth
      ));
      setBorders(this.padding.style, getValues(
        style.paddingTop, style.paddingRight,
        style.paddingBottom, style.paddingLeft
      ));
    } else {
      this.el.style.display = 'none';
    }

    // TODO: find a better way to stay updated...
    requestAnimationFrame(this.refresh);
  }
}