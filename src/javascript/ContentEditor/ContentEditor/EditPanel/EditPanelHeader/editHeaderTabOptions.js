/**
 * Builds the moonstone Dropdown option for a Content Editor header tab (a `editHeaderTabsActions`
 * registry action).
 *
 * Besides the usual `buttonLabel` / `buttonIcon`, a tab may contribute an optional **`buttonBadge`** —
 * a React element rendered after the label as the option's trailing `iconEnd` (e.g. a live per-node
 * version count on the content-versioning tab, issue #2555). The badge is owned by the contributing
 * module, which fetches whatever it needs to display; tabs that omit it render exactly as before
 * (`iconEnd` stays undefined).
 *
 * @param {object} tab a resolved header-tab action
 * @param {function} t the i18n translator (buttonLabel is an i18n key)
 * @returns {import('@jahia/moonstone').DropdownDataOption}
 */
export const buildTabOption = (tab, t) => ({
    value: tab.value,
    label: t(tab.buttonLabel),
    iconStart: tab.buttonIcon,
    iconEnd: tab.buttonBadge,
    attributes: {'data-sel-role': tab.dataSelRole}
});
