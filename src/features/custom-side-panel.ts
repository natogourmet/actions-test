import { ConfigureUI } from '@/configure/ConfigureUI';
import { ConfigureAttribute } from '@/configure/model/ConfigureAttribute';

const FC_PAGER_GROUPER = 'fc-pager-grouper';

/**
 * Creates the group header on mobile side panel adding group name in the
 * first item of every group.
 *
 * @param configure ConfigureUI instance
 */
export function addGroupOnSidePanel(configure: ConfigureUI): void {
  // Register hook to add content before the attribute header
  configure.registerHook('component.attributeHeader.beforeHtml', (ca: ConfigureAttribute) => {
    const group = configure.getCAGroup(ca);
    if (!group) return;
    if (ca.id !== group.attributes[0]) return;

    // It Only add group name if the item is the first item of the group
    return /*html*/ `
      <div class='${FC_PAGER_GROUPER}'>
        <div class='${FC_PAGER_GROUPER}-icon'>
          <span class='${FC_PAGER_GROUPER}-${group.name.toLowerCase()}-icon'></span>
        </div>
        <div class='${FC_PAGER_GROUPER}-name'>
          ${group.name}
        <div>
      </div>`;
  });
}
