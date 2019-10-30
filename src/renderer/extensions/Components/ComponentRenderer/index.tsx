import React from 'react';
import parse from 'html-react-parser';
import Link from '../../../../common/data/Link';
import LObject from '../../../../common/data/objects/LObject';
import MutableField from '../../../../common/data/fields/MutableField';
import ComponentContentField from '../ComponentContentField';
import Field from '../../../../common/data/fields/Field';
import {
  useWatchLink,
  useLink,
  useFieldValue,
  useFieldGetter } from '../../../LoomUI/util/hooks';
import ContentObserver from '../../../../common/events/ContentObserver';
import { manage, Manager, manageMany } from '../../../LoomUI/util/imperative';

import './ComponentRenderer.scss';

export interface ComponentRendererProps { object: LObject }
export type ComponentRenderer = React.ComponentType<ComponentRendererProps>;
export interface RendererProps<F extends Field = Field> {
  field: F;
  object: LObject;
}
export type Renderer<F extends Field = Field>
  = React.ComponentType<RendererProps<F>>;

function manageAttributes(comp: LObject): Manager {
  const attrs = new Link(comp, 'html.attr.*');
  let attrObs: ContentObserver | null = null;

  return manage((node: HTMLElement) => {
    const attrMap = attrs.getFieldValues();
    for (const key in attrMap) {
      node.setAttribute(key.substring(10), attrMap[key]);
    }

    attrObs = attrs.observe().content(true).on('update', (link: Link) => {
      node.setAttribute(link.fieldName.substring(10), link.getFieldValue());
    });

    return () => attrObs!.destroy();
  });
}

function manageStyles(comp: LObject): Manager {
  const styles = new Link(comp, 'style.*');

  return manage((node: HTMLElement) => {
    const styleMap = styles.getFieldValues();
    for (const key in styleMap) {
      node.style.setProperty(key.substring(6), styleMap[key]);
    }

    const attrObs = styles.observe().content(true).on('update',
      (link: Link) => {
        node.style.setProperty(link.fieldName.substring(6), '');
        node.style.setProperty(
          link.fieldName.substring(6),
          link.getFieldValue()
        );
      }
    );

    return () => attrObs!.destroy();
  });
}

const ComponentRenderer: ComponentRenderer
  = (props: ComponentRendererProps) => {
    const tagLink = useLink(props.object, 'html.tag');
    useWatchLink(tagLink, true);
    const tag = tagLink.getFieldValueOrDefault('') || 'div';

    const manager = React.useMemo(
      () => manageMany(
        manageAttributes(props.object),
        manageStyles(props.object)
      ),
      [props.object]
    );

    const icLink = useLink(props.object, 'html.innercontent');

    return React.createElement(
      tag,
      { ref: manager },
      <LinkRenderer link={icLink} />
    );
  }

const MutableFieldRenderer: Renderer<MutableField>
  = (props: RendererProps<MutableField>) => {
    const parts = useFieldGetter(
      props.field,
      props.object,
      (f: MutableField, o: LObject) => f.raw(o),
      false
    );

    return <>{
      parts && parts.map((p, i) => typeof p === 'string'
        ? parse(p)
        : <LinkRenderer key={i} link={p} />)
    }</>
  }

const DefaultFieldRenderer: Renderer =
  (props: RendererProps) => {
    const content = useFieldValue(props.field, props.object);
    return <>{content && parse(content)}</>
  }

export interface LinkRendererProps { link: Link }
export type LinkRenderer = React.ComponentType<LinkRendererProps>;

const LinkRenderer: LinkRenderer = (props: LinkRendererProps) => {
  useWatchLink(props.link);

  const field = props.link.maybeGetField();
  const object = props.link.getObject();

  if (field instanceof ComponentContentField) {
    return <ComponentRenderer object={object} />
  } else if (field instanceof MutableField) {
    return <MutableFieldRenderer field={field} object={object} />
  } else if (field) {
    return <DefaultFieldRenderer field={field} object={object} />
  } else {
    return <></>
  }
}

export default ComponentRenderer;