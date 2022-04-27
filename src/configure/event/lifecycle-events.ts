import { EventBusWrapper } from './EventBusWrapper';

/**
 * Component Lifecycle events
 */
const COMPONENT_LIFECYCLE_EVENTS = {
  CREATED: 'component:created',
  DESTROYED: 'component:destroyed'
};

export type LifecycleEvent = 'component:created' | 'component:destroyed';

/** Determines if the event is a Component Lifecycle event */
export function isLifecycleEvent(eventName: string): boolean {
  return eventName === COMPONENT_LIFECYCLE_EVENTS.CREATED || eventName === COMPONENT_LIFECYCLE_EVENTS.DESTROYED;
}

/**
 * Handles the EventBusWrapper when the MQ changes
 * @param em EventBusWrapper
 * @param eventBus the component real event bus (if defined)
 * @param matches flag that indicates whether the current mq matches or not
 */
export function handleResponsiveEventBus(
  em: EventBusWrapper<LifecycleEvent>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  eventBus: any,
  matches: boolean
): void {
  if (matches) {
    // If it matches, set the delegate and trigger 'created'
    em.delegate = eventBus;
    em.trigger('component:created');
  } else if (em.delegate !== null) {
    // If it doesn't match, remove the delegate and trigger 'destroyed'
    em.delegate = null;
    em.trigger('component:destroyed');
  }
}
