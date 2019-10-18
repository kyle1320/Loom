import React from 'react';
import parse from 'html-react-parser';
import Link from '../../../../common/data/Link';
import LObject from '../../../../common/data/LObject';
import BasicField from '../../BasicFields/BasicField';
import ComponentContentField from '../ComponentContentField';
import Field from '../../../../common/data/Field';
import {
  useWatchLink,
  useLink,
  useFieldValue } from '../../../LoomUI/util/hooks';
import ContentObserver from '../../../../common/events/ContentObserver';

import './ComponentRenderer.scss';

export interface ComponentRendererProps { object: LObject }
export type ComponentRenderer = React.ComponentType<ComponentRendererProps>;
export interface RendererProps<F extends Field = Field> {
  field: F;
  object: LObject;
}
export type Renderer<F extends Field = Field>
  = React.ComponentType<RendererProps<F>>;

type Manager = (node: HTMLElement | null) => void;

function manageAttributes(comp: LObject): Manager {
  const attrs = comp.getLink('html.attr.*');

  let curNode: HTMLElement | null = null;
  let attrObs: ContentObserver | null = null;

  return (node: HTMLElement | null) => {
    if (curNode && curNode != node) {
      attrObs!.destroy();
    }

    curNode = node;

    if (node) {
      const attrMap = attrs.getFieldValues();
      for (const key in attrMap) {
        node.setAttribute(key.substring(10), attrMap[key]);
      }

      attrObs = attrs.observe().content(true).on('update', (link: Link) => {
        node.setAttribute(link.fieldName.substring(10), link.getFieldValue());
      });
    }
  };
}

function manageStyles(comp: LObject): Manager {
  const styles = comp.getLink('style.*');

  let curNode: HTMLElement | null = null;
  let attrObs: ContentObserver | null = null;

  return (node: HTMLElement | null) => {
    if (curNode && curNode != node) {
      attrObs!.destroy();
    }

    curNode = node;

    if (node) {
      const styleMap = styles.getFieldValues();
      for (const key in styleMap) {
        node.style.setProperty(key.substring(6), styleMap[key]);
      }

      attrObs = styles.observe().content(true).on('update', (link: Link) => {
        node.style.setProperty(link.fieldName.substring(6), '');
        node.style.setProperty(
          link.fieldName.substring(6),
          link.getFieldValue()
        );
      });
    }
  };
}

function manageMany(...managers: Manager[]): Manager {
  return (node: HTMLElement | null) => {
    managers.forEach(m => m(node));
  };
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

const BasicFieldRenderer: Renderer<BasicField>
  = (props: RendererProps<BasicField>) => {
    const parts = useFieldValue(
      props.field,
      props.object,
      (f: BasicField, o: LObject) => f.raw(o),
      false
    );

    return <>{
      parts && parts.map(p => typeof p === 'string'
        ? parse(p)
        : <LinkRenderer link={p} />)
    }</>
  }

const DefaultFieldRenderer: Renderer =
  (props: RendererProps) => {
    const content = useFieldValue(
      props.field,
      props.object,
      (f: Field, o: LObject) => f.get(o),
      false
    );
    return <>{content && parse(content)}</>
  }

export interface LinkRendererProps { link: Link }
export type LinkRenderer = React.ComponentType<LinkRendererProps>;

const LinkRenderer: LinkRenderer = (props: LinkRendererProps) => {
  useWatchLink(props.link);

  const field = props.link.maybeGetField();
  const object = props.link.getObject();

  // TODO: handle this via plugins
  if (field instanceof ComponentContentField) {
    return <ComponentRenderer object={object} />
  } else if (field instanceof BasicField) {
    return <BasicFieldRenderer field={field} object={object} />
  } else if (field) {
    return <DefaultFieldRenderer field={field} object={object} />
  } else {
    return <></>
  }
}

export default ComponentRenderer;