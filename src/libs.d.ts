//*******************************************************************************************/
// In this file we add all the typing definitions for libraries that don't have one
//*******************************************************************************************/

/**
 * internetips (https://jhartman86.github.io/internetips/)
 */
declare module 'internetips' {
  interface TooltipConfig {
    containerClass?: string;
    tooltipClass?: string;
    activeClass?: string;
    placeClass?: {
      top?: string;
      right?: string;
      bottom?: string;
      left?: string;
    };
    typeClass?: {
      dark?: string;
      light?: string;
    };
    defaults?: Partial<TooltipOpts>;
  }

  interface TooltipOpts {
    place?: 'top' | 'right' | 'bottom' | 'left';
    type?: 'dark' | 'light';
    classes?: string[];
    offsetX?: number;
    offsetY?: number;
    target: EventTarget | null | undefined;
    content: string;
    effect?: 'solid' | 'float';
  }
  const internetips: {
    show(opts: TooltipOpts): void;
    hide(): void;
    setConfig(opts: TooltipConfig): void;
  };
  export default internetips;
}
