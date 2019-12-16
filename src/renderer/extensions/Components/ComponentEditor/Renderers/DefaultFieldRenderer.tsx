import React from 'react';
import parse from 'html-react-parser';

import { Renderer, RendererProps } from '.';

import { useFieldValue } from '../../../../LoomUI/util/hooks';

const DefaultFieldRenderer: Renderer =
  (props: RendererProps) => {
    const content = useFieldValue(props.field, props.object);
    return <>{content && parse(content)}</>
  }

export default DefaultFieldRenderer;