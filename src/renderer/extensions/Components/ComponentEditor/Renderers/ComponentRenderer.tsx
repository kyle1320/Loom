import React from 'react';

import LinkRenderer from './LinkRenderer';

import DataObject from '../../../../../common/data/objects/DataObject';
import { useLink, useWatchLink } from '../../../../LoomUI/util/hooks';
import { manageMany, Manager, manage }
  from '../../../../LoomUI/util/imperative';
import Link from '../../../../../common/data/Link';
import ContentObserver from '../../../../../common/events/ContentObserver';
import { EditFrameContext } from '../EditFrame/WithEditFrame';

export interface ComponentRendererProps { object: DataObject }
export type ComponentRenderer = React.ComponentType<ComponentRendererProps>;

function manageAttributes(comp: DataObject): Manager {
  const attrs = Link.to(comp, 'html.attr.*');
  let attrObs: ContentObserver | null = null;

  return manage((node: HTMLElement) => {
    const attrMap = attrs.getFieldValues();
    for (const key in attrMap) {
      node.setAttribute(key.substring(10), attrMap[key]);
    }

    attrObs = attrs.observe().content(true).on('update', (link: Link) => {
      const field = link.maybeGetField();
      const attr = link.fieldName.substring(10);

      if (field) {
        node.setAttribute(attr, field.get(link.getObject()));
      } else {
        node.removeAttribute(attr);
      }
    });

    return () => attrObs!.destroy();
  });
}

function manageStyles(comp: DataObject): Manager {
  const styles = Link.to(comp, 'style.*');

  return manage((node: HTMLElement) => {
    const styleMap = styles.getFieldValues();
    for (const key in styleMap) {
      node.style.setProperty(key.substring(6), styleMap[key]);
    }

    const styleObs = styles.observe().content(true).on('update',
      (link: Link) => {
        node.style.setProperty(link.fieldName.substring(6), '');
        node.style.setProperty(
          link.fieldName.substring(6),
          link.getFieldValueOrDefault('')
        );
      }
    );

    return () => styleObs!.destroy();
  });
}

const ComponentRenderer: ComponentRenderer
  = (props: ComponentRendererProps) => {
    const tagLink = useLink(props.object, 'html.tag');
    useWatchLink(tagLink, true);
    const tag = tagLink.getFieldValueOrDefault('') || 'div';

    const frameProps = React.useContext(EditFrameContext)(props.object);
    const manager = React.useMemo(
      () => manageMany(
        manageAttributes(props.object),
        manageStyles(props.object),
        frameProps.ref
      ),
      [props.object]
    );
    frameProps.ref = manager;

    const icLink = useLink(props.object, 'html.innercontent');

    return React.createElement(
      tag,
      frameProps,
      <LinkRenderer link={icLink} />
    );
  }

export default ComponentRenderer;