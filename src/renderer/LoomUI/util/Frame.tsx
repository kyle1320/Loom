import React from 'react';
import ReactDom from 'react-dom';

import { Manager, manage } from './imperative';

import './Frame.scss';

export type FrameProps = {
  head?: (() => React.ReactElement);
  body?: (() => React.ReactElement);
} & React.IframeHTMLAttributes<HTMLIFrameElement>
export type Frame = React.ComponentType<FrameProps>;

function getFrameManager(
  head: (() => React.ReactElement) | void,
  body: (() => React.ReactElement) | void
): Manager<HTMLIFrameElement> {
  return manage((node: HTMLIFrameElement) => {
    node.onload = () => {
      const doc = node.contentDocument!;
      head && ReactDom.render(head(), doc.head);
      body && ReactDom.render(body(), doc.body);
    };
    return () => {};
  });
}

export const Frame: Frame = (props: FrameProps) => {
  const { head, body, ...otherProps } = props;

  const ref = React.useMemo(
    () => getFrameManager(head, body),
    [head, body]
  );
  const url = React.useMemo(() => {
    const blob = new Blob([''], { type: 'text/html' });
    return window.URL.createObjectURL(blob);
  }, [head, body]);
  return <iframe
    ref={ref} src={url} width="100%" height="100%" frameBorder="0"
    {...otherProps}></iframe>;
}

export const ResizableFrame: Frame = (props: FrameProps) => {
  const className = props.className
    ? props.className + ' resizable-frame'
    : 'resizable-frame';

  return <div className="resizable-frame__container">
    <Frame {...props} className={className} />
  </div>;
}