import React from 'react';
import ReactDom from 'react-dom';

import './Frame.scss';

export type FrameProps = React.IframeHTMLAttributes<HTMLIFrameElement>;

function isEl(x: React.ReactNode): x is React.ReactElement {
  return typeof x === 'object' && !!x && 'type' in x;
}

class Frame extends React.Component<FrameProps> {
  private url: string;
  private iframe: HTMLIFrameElement | null = null;

  public constructor(props: FrameProps) {
    super(props);

    const blob = new Blob([''], { type: 'text/html' });
    this.url = window.URL.createObjectURL(blob);
  }

  private ref = (node: HTMLIFrameElement | null): void => {
    this.iframe = null;

    if (node) {
      node.onload = () => {
        this.iframe = node;
        this.componentDidUpdate();
      };
    }
  }

  public componentDidUpdate(): void {
    if (this.iframe) {
      const doc = this.iframe.contentDocument!;
      let ch = this.props.children;

      // render from <head> element
      if (ch instanceof Array) {
        const [hd, ...body] = ch;
        if (isEl(hd) && hd.type === 'head') {
          ReactDom.render(<>{hd.props.children}</>, doc.head);
          ch = body;
        }
      }

      // render from <body> element
      if (ch instanceof Array && ch.length === 1) {
        const bd = ch[0];
        if (isEl(bd) && bd.type === 'body') {
          ReactDom.render(<>{bd.props.children}</>, doc.body);
          ch = null;
        }
      }

      // render remaining elements into body
      if (ch) {
        ReactDom.render(<>{ch}</>, doc.body);
      }
    }
  }

  public render(): JSX.Element {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { children, ...otherProps } = this.props;

    return <iframe
      ref={this.ref} src={this.url} width="100%" height="100%" frameBorder="0"
      {...otherProps}></iframe>;
  }
}

export default Frame;