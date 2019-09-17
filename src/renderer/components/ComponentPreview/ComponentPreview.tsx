import { makeElement } from '../../util/dom';
import FieldReferenceError from '../../../common/errors/FieldReferenceError';

import './ComponentPreview.scss';
import ComponentContentField
  from '../../extensions/Components/ComponentContentField';
import Link from '../../../common/data/Link';
import BasicField from '../../extensions/BasicFields/BasicField';

export function addFieldNodesToParent(el: HTMLElement, link: Link): void {
  const field = link.getField();

  if (field instanceof BasicField) {
    for (const part of field.raw(link.getObject())) {
      if (typeof part === 'string') {
        el.appendChild(document.createTextNode(part));
      } else {
        addFieldNodesToParent(el, part);
      }
    }
  } else {
    // eslint-disable-next-line
    el.appendChild(new ComponentPreview(link).element);
  }
}

export default class ComponentPreview {
  public element: HTMLElement;

  private tag: Link;
  private attrs: Link;
  private content: Link;

  public constructor(link: Link) {
    this.element = <div/>;

    const field = link.getField();

    if (!field || !(field instanceof ComponentContentField)) {
      throw new FieldReferenceError();
    }

    this.updateTag = this.updateTag.bind(this);
    this.updateAttr = this.updateAttr.bind(this);
    this.updateContent = this.updateContent.bind(this);

    this.tag = field.tag(link.getObject());
    this.attrs = field.attrs(link.getObject());
    this.content = field.content(link.getObject());

    this.tag.observe().content(true)
      .on('update', this.updateTag);
    this.attrs.observe().content(true)
      .on('update', this.updateAttr);

    // TODO: don't be recursive
    this.content.observe().content(false)
      .on('update', this.updateContent);

    this.rebuild();
  }

  private rebuild(): void {
    const el = document.createElement(this.tag.getFieldValueOrDefault('div'));
    this.element.replaceWith(el);
    this.element = el;

    this.updateAttr(this.attrs);
    this.updateContent(this.content);
  }

  private updateTag(link: Link): void {
    // tag cannot easily be changed; rebuild everything
    this.rebuild();
  }

  private updateAttr(link: Link): void {
    const attrs = link!.getFieldValues();

    for (const key in attrs) {
      // skip 'html.attr.'
      this.element.setAttribute(key.substr(10), attrs[key]);
    }
  }

  private updateContent(link: Link): void {
    // TODO: do a diff, only update what's necessary
    this.element.innerHTML = '';
    addFieldNodesToParent(this.element, link);
  }
}