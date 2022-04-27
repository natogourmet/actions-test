import { sleep } from '@/configure/utils/general';

export async function slideUp(
  container: HTMLElement,
  ms: number = 500,
  timingFunction: string = 'ease-in-out'
): Promise<void> {
  // Change the height from auto to absolute value for transition effect.
  container.style.transitionDuration = 0 + 'ms';
  container.style.height = container.clientHeight + 'px';
  await sleep(0);
  container.style.transitionDuration = ms + 'ms';
  container.style.transitionProperty = 'height';
  container.style.transitionTimingFunction = timingFunction;
  container.style.height = '0px';
  await sleep(ms);
}

export async function slideDown(
  container: HTMLElement,
  height: number,
  ms: number = 500,
  timingFunction: string = 'ease-in-out'
): Promise<void> {
  container.style.transitionDuration = ms + 'ms';
  container.style.transitionProperty = 'height';
  container.style.transitionTimingFunction = timingFunction;
  container.style.height = height + 'px';
  //TODO: Listen end animation event
  await sleep(ms);
  // Change the height from absolute value to auto for automatic resizing.
  container.style.height = 'auto';
}

export function hide(element: HTMLElement): void {
  element.hidden = true;
}

export function show(element: HTMLElement): void {
  element.hidden = false;
}
