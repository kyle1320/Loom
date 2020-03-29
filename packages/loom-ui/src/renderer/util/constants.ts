/* eslint-disable max-len */
import properties from './properties';
import type { DeepReadonly } from '.';

type Constants = DeepReadonly<{
  css: {
    units: {
      absoluteLengths: string[];
      relativeLengths: string[];
      lengths: string[];
      angles: string[];
      frequencies: string[];
      gridLengths: string[];
      resolutions: string[];
      times: string[];
    };
    colors: string[];
    properties: Record<string, {
      type: 'any' | 'color' | 'number';
      summary: string;
    } | {
      type: 'select';
      values: string[];
      summary: string;
    }>;
  };
  html: {
    basicTags: string[];
    metadata: string[];
    flow: string[];
    sectioning: string[];
    heading: string[];
    phrasing: string[];
    embedded: string[];
    interactive: string[];
    form: string[];
    empty: string[];
  };
}>;

const constants: Constants = {
  css: {
    units: {
      absoluteLengths: ['cm', 'mm', 'in', 'px', 'pt', 'pc'],
      relativeLengths: ['em', '%', 'ex', 'ch', 'rem', 'vw', 'vh', 'vmin', 'vmax'],
      lengths: ['cm', 'mm', 'in', 'px', 'pt', 'pc', 'em', '%', 'ex', 'ch', 'rem', 'vw', 'vh', 'vmin', 'vmax'],
      angles: ['deg', 'grad', 'rad', 'turn'],
      frequencies: ['Hz', 'kHz'],
      gridLengths: ['fr'],
      resolutions: ['dpcm', 'dpi', 'dppx', 'x'],
      times: ['ms', 's']
    },
    colors: [
      'black', 'silver', 'gray', 'white', 'maroon', 'red', 'purple', 'fuchsia', 'green', 'lime', 'olive', 'yellow', 'navy', 'blue', 'teal', 'aqua', 'orange', 'aliceblue', 'antiquewhite', 'aquamarine', 'azure', 'beige', 'bisque', 'blanchedalmond', 'blueviolet', 'brown', 'burlywood', 'cadetblue', 'chartreuse', 'chocolate', 'coral', 'cornflowerblue', 'cornsilk', 'crimson', 'cyan', 'darkblue', 'darkcyan', 'darkgoldenrod', 'darkgray', 'darkgreen', 'darkgrey', 'darkkhaki', 'darkmagenta', 'darkolivegreen', 'darkorange', 'darkorchid', 'darkred', 'darksalmon', 'darkseagreen', 'darkslateblue', 'darkslategray', 'darkslategrey', 'darkturquoise', 'darkviolet', 'deeppink', 'deepskyblue', 'dimgray', 'dimgrey', 'dodgerblue', 'firebrick', 'floralwhite', 'forestgreen', 'gainsboro', 'ghostwhite', 'gold', 'goldenrod', 'greenyellow', 'grey', 'honeydew', 'hotpink', 'indianred', 'indigo', 'ivory', 'khaki', 'lavender', 'lavenderblush', 'lawngreen', 'lemonchiffon', 'lightblue', 'lightcoral', 'lightcyan', 'lightgoldenrodyellow', 'lightgray', 'lightgreen', 'lightgrey', 'lightpink', 'lightsalmon', 'lightseagreen', 'lightskyblue', 'lightslategray', 'lightslategrey', 'lightsteelblue', 'lightyellow', 'limegreen', 'linen', 'magenta', 'mediumaquamarine', 'mediumblue', 'mediumorchid', 'mediumpurple', 'mediumseagreen', 'mediumslateblue', 'mediumspringgreen', 'mediumturquoise', 'mediumvioletred', 'midnightblue', 'mintcream', 'mistyrose', 'moccasin', 'navajowhite', 'oldlace', 'olivedrab', 'orangered', 'orchid', 'palegoldenrod', 'palegreen', 'paleturquoise', 'palevioletred', 'papayawhip', 'peachpuff', 'peru', 'pink', 'plum', 'powderblue', 'rosybrown', 'royalblue', 'saddlebrown', 'salmon', 'sandybrown', 'seagreen', 'seashell', 'sienna', 'skyblue', 'slateblue', 'slategray', 'slategrey', 'snow', 'springgreen', 'steelblue', 'tan', 'thistle', 'tomato', 'turquoise', 'violet', 'wheat', 'whitesmoke', 'yellowgreen', 'rebeccapurple'
    ],
    properties
  },
  html: {
    basicTags: ['a', 'b', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'ol', 'p', 'span', 'table', 'u', 'ul'],
    metadata: ['title', 'link', 'meta', 'script', 'style', 'base', 'noscript'],
    flow: ['a', 'abbr', 'address', 'article', 'aside', 'audio', 'b', 'bdo', 'bdi', 'blockquote', 'br', 'button', 'canvas', 'cite', 'code', 'data', 'datalist', 'del', 'details', 'dfn', 'div', 'dl', 'em', 'embed', 'fieldset', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hgroup', 'hr', 'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'label', 'main', 'map', 'mark', 'math', 'menu', 'meter', 'nav', 'noscript', 'object', 'ol', 'output', 'p', 'picture', 'pre', 'progress', 'q', 'ruby', 's', 'samp', 'script', 'section', 'select', 'small', 'span', 'strong', 'sub', 'sup', 'svg', 'table', 'template', 'textarea', 'time', 'ul', 'var', 'video', 'wbr'],
    sectioning: ['article', 'aside', 'nav', 'section'],
    heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hgroup'],
    phrasing: ['a', 'abbr', 'audio', 'b', 'bdo', 'br', 'button', 'canvas', 'cite', 'code', 'data', 'datalist', 'dfn', 'em', 'embed', 'i', 'iframe', 'img', 'input', 'kbd', 'label', 'mark', 'math', 'meter', 'noscript', 'object', 'output', 'picture', 'progress', 'q', 'ruby', 'samp', 'script', 'select', 'small', 'span', 'strong', 'sub', 'sup', 'svg', 'textarea', 'time', 'var', 'video', 'wbr'],
    embedded: ['audio', 'canvas', 'embed', 'iframe', 'img', 'math', 'object', 'picture', 'svg', 'video'],
    interactive: ['a', 'button', 'details', 'embed', 'iframe', 'label', 'select', 'textarea'],
    form: ['button', 'fieldset', 'input', 'label', 'meter', 'object', 'output', 'progress', 'select', 'textarea'],
    empty: ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']
  }
};

export default constants;