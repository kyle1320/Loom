import Pickr from '@simonwep/pickr';
import * as RealPickr from '@simonwep/pickr';

import { WritableValue } from 'loom-data';

import { UIComponent } from '@/UIComponent';
import { makeElement } from '@/util/dom';

import './ColorPicker.scss';

export default class ColorPicker extends UIComponent<{}, HTMLElement> {
  public constructor(private readonly value: WritableValue<string>) {
    super(makeElement('div', { className: 'color-picker' }));

    let ignoreEvent = false;

    const pickerEl = makeElement('div');
    this.el.appendChild(pickerEl);

    // hack around lack of ES6 imports
    const pickr = (RealPickr as unknown as typeof Pickr).create({
      el: pickerEl,
      theme: 'nano',
      comparison: false,
      default: value.get(),
      defaultRepresentation: 'HEXA',
      components: {
        preview: true,
        opacity: true,
        hue: true,
        interaction: {
          hex: true,
          rgba: true,
          input: true
        }
      }
    }).on('change', (color: Pickr.HSVaColor) => {
      if (!ignoreEvent) {
        ignoreEvent = true;
        const rgba = color.toRGBA();
        this.value.set(
          rgba[3] < 1 ? rgba.toString(0) : color.toHEXA().toString()
        );
        ignoreEvent = false;
      }
    });

    this.destroy.do(value.watch(v => {
      if (!ignoreEvent) {
        ignoreEvent = true;
        pickr.setColor(v, true);
        ignoreEvent = false;
      }
    }), () => pickr.destroyAndRemove());
  }
}