declare namespace JSX {
  type IntrinsicElements =
    {
      [T in keyof HTMLElementTagNameMap]: {
        [K in keyof HTMLElementTagNameMap[T]]?: K extends 'style'
          ? Partial<HTMLElementTagNameMap[T][K]>
          : HTMLElementTagNameMap[T][K]
      }
    };
}