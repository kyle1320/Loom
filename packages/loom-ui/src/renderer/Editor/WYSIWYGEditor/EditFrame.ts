import * as loom from 'loom-core';

import { UIComponent } from '@/UIComponent';
import LiveDocument, { LiveNode } from '@/LiveDocument';
import { makeElement, toggleClass } from '@/util/dom';
import { isElement } from '@/util/html';
import { IconButton } from '@/common';
import { showMenu } from '@/util/electron';

import './EditFrame.scss';

class EditFrameButtonPanel extends UIComponent<{}, HTMLElement> {
  public constructor(private readonly doc: LiveDocument) {
    super(makeElement('div', { className: 'edit-frame__button-panel' }));
  }

  public update(data: loom.Node | null): void {
    this.empty();

    if (!data) return;

    if (data instanceof loom.Element) {
      const menu = this.doc.ui.getAddMenu(data);
      const nonEmpty = menu.some(x => x.enabled ?? true);
      nonEmpty && this.appendChild(new IconButton('fa fa-plus')
        .on('click', () => showMenu(menu)));
    }

    if (data.source.parent()) {
      this.appendChild(new IconButton('fa fa-trash btn-red')
        .on('click', () => data.source.delete()));
    }
  }

  public positionOutside(outside: boolean): void {
    toggleClass(this.el, 'outside', outside);
  }
}

export default class EditFrame extends UIComponent<{}, HTMLElement> {
  private node: LiveNode | null = null;
  private style: CSSStyleDeclaration | null = null;

  private margin: HTMLElement;
  private border: HTMLElement;
  private padding: HTMLElement;

  private controls: EditFrameButtonPanel;

  public constructor(doc: LiveDocument) {
    super(null!);

    this.el = makeElement('div', { className: 'edit-frame' },
      this.margin = makeElement('div', { className: 'edit-frame__margin' }),
      this.border = makeElement('div', { className: 'edit-frame__border' },
        this.padding = makeElement('div', { className: 'edit-frame__padding' })
      )
    );

    this.appendChild(this.controls = new EditFrameButtonPanel(doc));

    doc.on('select', node => {
      const oldNode = this.node;
      this.node = node;
      this.style = null;
      this.controls.update(node && node.data);
      if (!oldNode) this.refresh();
    });
  }

  private refresh = (): void => {
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

    const n = this.node && this.node.getEl();
    const el = n && (isElement(n) ? n : n.parentElement);
    this.style = this.style || (el && window.getComputedStyle(el));
    if (el && this.style && this.style.display !== 'none') {
      const bounds = el.getBoundingClientRect();

      this.el.style.display = 'block';
      this.el.style.top = bounds.top + 'px';
      this.el.style.left = bounds.left + 'px';
      this.el.style.width = bounds.width + 'px';
      this.el.style.height = bounds.height + 'px';

      this.controls.positionOutside(bounds.height < 20);

      const margin = getValues(
        this.style.marginTop, this.style.marginRight,
        this.style.marginBottom, this.style.marginLeft
      );
      this.margin.style.top = -Math.max(0, margin.top) + 'px';
      this.margin.style.right = -Math.max(0, margin.right) + 'px';
      this.margin.style.bottom = -Math.max(0, margin.bottom) + 'px';
      this.margin.style.left = -Math.max(0, margin.left) + 'px';

      setBorders(this.margin.style, margin);
      setBorders(this.border.style, getValues(
        this.style.borderTopWidth, this.style.borderRightWidth,
        this.style.borderBottomWidth, this.style.borderLeftWidth
      ));
      setBorders(this.padding.style, getValues(
        this.style.paddingTop, this.style.paddingRight,
        this.style.paddingBottom, this.style.paddingLeft
      ));
    } else {
      this.el.style.display = 'none';
    }

    // TODO: find a better way to stay updated...
    requestAnimationFrame(this.refresh);
  }
}