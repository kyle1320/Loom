import React from 'react';

import ComponentRenderer from './ComponentRenderer';
import MutableFieldRenderer from './MutableFieldrenderer';
import DefaultFieldRenderer from './DefaultFieldRenderer';

import Link from '../../../../../common/data/Link';
import MutableField from '../../../../../common/data/fields/MutableField';
import ComponentContentField from '../../ComponentContentField';
import { useWatchLink } from '../../../../LoomUI/util/hooks';
import DataObject from '../../../../../common/data/objects/DataObject';

export interface LinkRendererProps { link: Link }
export type LinkRenderer = React.ComponentType<LinkRendererProps>;

const LinkRenderer: LinkRenderer = (props: LinkRendererProps) => {
  useWatchLink(props.link);

  const field = props.link.maybeGetField();
  const object = props.link.getObject();

  if (field instanceof ComponentContentField) {
    // TODO: ensure the object is a DataObject
    return <ComponentRenderer object={object as DataObject} />
  } else if (field instanceof MutableField) {
    return <MutableFieldRenderer field={field} object={object} />
  } else if (field) {
    return <DefaultFieldRenderer field={field} object={object} />
  } else {
    return <></>
  }
}

export default LinkRenderer;