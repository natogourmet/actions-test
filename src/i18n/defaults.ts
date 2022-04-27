/**
 * This file serves 3 purposes:
 *  1. Provides the default label when the key is not found on the fetched uiSettings i18n
 *  2. Types the keys argument to the function t (translate), to only accept the ones here
 *  3. Helps the audit of the json file submitted to admin studio by the implementation, it should match this
 */
export default {
  // default configure components labels
  addToCartButton_label: "I'm done customizing",

  // general use; literal translations; sorted alphabetically
  cancel: 'cancel', // ??
  copy: 'copy', // ??
  copied: 'copied', // ??
  continue: 'continue',
  got_it: 'Got it!', // ??
  please_note: 'Please note',
  start_over: 'Start Over',
  add_to_cart: 'Add to Cart',
  share: 'Share', // ??

  // Errors
  error_add_to_cart: 'An error occured while adding the product to cart. Please try again later',

  // dialogs
  start_over_desc: 'Your current design will be lost. Are you sure ?', // ??
  start_over_confirm: 'Yes, Start Over', // ??
  share_copy_link: 'Copy the link below', // ??

  // layout
  ly_style: 'Style',
  ly_style_desc: 'Express yourself with custom colors, graphics and more.',
  ly_personalize: 'Personalize',
  ly_personalize_desc: 'Make it your own with your team name, crest, and more.',
  ly_more_actions: 'More Actions',
  ly_rotate_zoom: 'Rotate and zoom', // ??
  ly_share_design: 'Share your design', // ??
  ly_share_design_link: 'Get a link', // ??

  // used in features/league-rules
  lr_compliance: 'compliance',
  lr_instructions_1: 'To get started, make your compliance choice below',
  lr_instructions_2: 'to change the Compliance setting you have to click',

  // used in features/image-gallery
  ig_upload_image: 'Upload Image',
  ig_remove_image: 'Remove Image',
  ig_my_image_gallery: 'My Image Gallery',
  ig_rules: 'You can upload as JPEG or PNG file.',
  ig_previously: 'Or you can review previously uploaded images',
  ig_different_image: 'Select a different image from gallery',
  ig_selected_image: 'Selected Image',

  // more actions
  ma_view_snapshots: 'View snapshots',
  ma_capture_design: 'Capture Your Design', // ??
  ma_take_a_snapshot: 'Take a snapshot </a> and review it later', // ??

  // used in product personalization - toggle (features/personalization/toggle)
  pp_add: 'Add', // ??
  pp_remove: 'Remove', // ??
  pp_team_name_add: 'Add team name',
  pp_team_name_remove: 'Remove team name',
  pp_player_name_add: 'Add player name',
  pp_player_name_remove: 'Remove player name',
  pp_player_number_add: 'Add player number',
  pp_player_number_remove: 'Remove player number',
  pp_player_initials_add: 'Add player initials',
  pp_player_initials_remove: 'Remove player initials',
  pp_team_slogan_add: 'Add team slogan',
  pp_team_slogan_remove: 'Remove team slogan',
  pp_team_crest_add: 'Add team crest',
  pp_team_crest_remove: 'Remove team crest',
  pp_sponsor_logo_add: 'Add sponsor logo',
  pp_sponsor_logo_remove: 'Remove sponsor logo',
  pp_team_wordmark_add: 'Add team wordmark', // ??
  pp_team_wordmark_remove: 'Remove team wordmark', // ??
  pp_front_logo_add: 'Add front logo', // ??
  pp_front_logo_remove: 'Remove front logo', // ??
  pp_back_logo_add: 'Add back logo', // ??
  pp_back_logo_remove: 'Remove back logo', // ??

  // used in product personalization - font-preview (features/personalization/font-preview)
  pp_preview_font: 'Preview font', // ??
  pp_preview_font_example: 'Almost before we knew it, we had left the ground.', // ??

  // used in product personalization - location conflicts (features/personalization/location_conflicts)
  pp_location_conflict: 'This location is already occupied by <strong>{ca}</strong>' // ?
};
