import { ConfigureUI } from '@/configure/ConfigureUI';
import { t } from '@/i18n';
import { mq } from '@/utils/MediaQuery';
import { buildSwatchTooltip } from './tooltip';
import { createPager } from '@/features/pager';

export async function createMenu(configure: ConfigureUI): Promise<void> {
  await Promise.all([
    // createAccordion(configure, '.configure-nav-lg', '(min-width: 993px)'),
    createAccordion(configure, '.configure-nav-lg', mq.getQuery('greater-than-md')),

    // createPager(configure, '.configure-nav-sm', '(max-width: 480px)'),
    createPager(configure, '.configure-nav-md', mq.getQuery('lower-than-md'))

    // createPager(configure, '.configure-nav-md', '(min-width: 481px) and (max-width: 992px)')
    // await createPager(configure, '.configure-nav-md', CUSTOM_MEDIA['--between-sm-md'])
    // createNavFlyout(configure)
  ]);
}

async function createAccordion(configure: ConfigureUI, container: string, mediaQuery?: string) {
  /*const menu = */ await configure.createComponent({
    mediaQuery,
    type: 'accordion',
    nested: true,
    showGroupName: true,
    container,
    uiSettings: {
      selectorLayout: {
        showName: true
      },
      attributeValueTooltip: {
        extended: true,
        content: (av) => buildSwatchTooltip(configure, av),
        position: 'left'
      },
      groups: {
        ignore: ['Compliance'],
        i18n: {
          style: {
            title: t('ly_style'),
            desc: t('ly_style_desc')
          },
          personalize: {
            title: t('ly_personalize'),
            desc: t('ly_personalize_desc')
          }
        }
      }
    }
  });

  // open ugc editor handler
  // handleOpenUgcEditor(menu);
}

/** Commented since it's not used in the example. Remove comments to use  */
// async function createNavFlyout(configure: ConfigureUI, container: string, mediaQuery?: string) {
//   /*const menu = */ await configure.createComponent({
//     mediaQuery,
//     type: 'navFlyout',
//     previewSwatches: false,
//     container,
//     uiSettings: {
//       attributeValueTooltip: {
//         extended: true,
//         content: (ca) => tooltipContent(configure, ca),
//         position: 'left'
//       }
//     }
//   });

//   // open ugc editor handler
//   handleOpenUgcEditor(menu);
// }
