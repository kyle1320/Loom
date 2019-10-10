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

function manageAttributes(comp: LObject): (node: HTMLElement | null) => void {
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

const ComponentRenderer: ComponentRenderer
  = (props: ComponentRendererProps) => {
    const tagLink = useLink(props.object, 'html.tag');
    useWatchLink(tagLink, true);
    const tag = tagLink.getFieldValueOrDefault('') || 'div';

    const attrManager
      = React.useMemo(() => manageAttributes(props.object), [props.object]);

    const icLink = useLink(props.object, 'html.innercontent');

    return React.createElement(
      tag,
      { ref: attrManager },
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