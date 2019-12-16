import React from 'react';
import parse from 'html-react-parser';

import LinkRenderer from './LinkRenderer';
import { Renderer, RendererProps } from '.';

import LObject from '../../../../../common/data/objects/LObject';
import MutableField from '../../../../../common/data/fields/MutableField';
import { useFieldGetter } from '../../../../LoomUI/util/hooks';

const MutableFieldRenderer: Renderer<MutableField>
  = (props: RendererProps<MutableField>) => {
    const parts = useFieldGetter(
      props.field,
      props.object,
      (f: MutableField, o: LObject) => f.raw(o),
      false
    );

    return <>{
      parts?.map((p, i) => typeof p === 'string'
        ? parse(p)
        : <LinkRenderer key={i} link={p} />)
    }</>
  }

export default MutableFieldRenderer;