import React from 'react';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {useSiteInfo} from '@jahia/data-helper';
import {Dropdown, Language} from '@jahia/moonstone';
import {cmGoto} from '~/JContent/redux/JContent.redux';
import {getCapitalized} from '~/ContentEditor/utils';

/**
 * Chooses the language the category titles are read in.
 *
 * Its own control rather than the one in jContent's secondary navigation: that one is styled for a
 * navigation column, down to a left border that divides it from the site switcher beside it, and it
 * shows the language as a two letter pill with the name only in a tooltip. Here there is room for
 * the name, so this follows the content editor instead - an icon and the language spelled out.
 *
 * The languages are systemsite's, because that is where categories live. They are not the current
 * site's, and there are usually more of them.
 */
const CATEGORIES_SITE = 'systemsite';

export const CategoriesLanguageSwitcher = () => {
    const dispatch = useDispatch();
    const {language, uilang} = useSelector(state => ({
        language: state.language,
        uilang: state.uilang
    }), shallowEqual);

    const {siteInfo, loading, error} = useSiteInfo({siteKey: CATEGORIES_SITE, displayLanguage: uilang});

    if (error) {
        console.error('Could not read the languages of ' + CATEGORIES_SITE, error);
        return null;
    }

    if (loading || !siteInfo) {
        return null;
    }

    const languages = (siteInfo.languages || []).filter(entry => entry.activeInEdit);

    // Nothing to choose between
    if (languages.length <= 1) {
        return null;
    }

    const data = languages.map(entry => ({
        label: getCapitalized(entry.uiLanguageDisplayName || entry.localizedDisplayName || entry.displayName),
        value: entry.language
    }));

    return (
        <Dropdown size="small"
                  icon={<Language/>}
                  data-cm-role="language-switcher"
                  data-selected-value={language}
                  value={language}
                  placeholder={data.find(entry => entry.value === language)?.label}
                  data={data}
                  onChange={(e, item) => {
                      if (item.value !== language) {
                          dispatch(cmGoto({language: item.value}));
                      }

                      return true;
                  }}
        />
    );
};

export default CategoriesLanguageSwitcher;
