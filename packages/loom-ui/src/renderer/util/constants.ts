/* eslint-disable max-len */
import properties from './properties';

type Constants = Readonly<{
  css: {
    units: {
      absoluteLengths: Readonly<string[]>;
      relativeLengths: Readonly<string[]>;
      lengths: Readonly<string[]>;
      angles: Readonly<string[]>;
      frequencies: Readonly<string[]>;
      gridLengths: Readonly<string[]>;
      resolutions: Readonly<string[]>;
      times: Readonly<string[]>;
    };
    colors: Readonly<string[]>;
    properties: Record<string, {
      type: 'any' | 'color' | 'number';
      summary: string;
    } | {
      type: 'select';
      values: Readonly<string[]>;
      summary: string;
    }>;
  };
  html: {
    basicTags: Readonly<string[]>;
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
    basicTags: [
      'a', 'b', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'hr', 'ol', 'p', 'span', 'u', 'ul'
    ]
  }
};

export default constants;