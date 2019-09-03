export const css = (...classNames: (string | false | undefined)[]) =>
  classNames.filter((className) => className).join(' ')