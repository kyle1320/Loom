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
      ignoreEvent = true;
      const rgba = color.toRGBA();
      this.value.set(
        rgba[3] < 1 ? rgba.toString(0) : color.toHEXA().toString()
      );
      ignoreEvent = false;
    });
    const input: HTMLInputElement = makeElement('input', {
      value: value.get(),
      oninput: () => value.set(input.value)
    });
    this.el.appendChild(input);

    this.autoCleanup(value.watch(v => {
      if (!ignoreEvent) pickr.setColor(v);
      input.value = v;
    }));
  }
}