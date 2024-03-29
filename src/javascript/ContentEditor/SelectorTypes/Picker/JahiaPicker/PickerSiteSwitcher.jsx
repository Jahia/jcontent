import React from 'react';
import {shallowEqual, useSelector} from 'react-redux';
import {cePickerMode, cePickerOpenPaths, cePickerPath, cePickerSite} from '~/ContentEditor/SelectorTypes/Picker/Picker.redux';
import {getDetailedPathArray} from '~/ContentEditor/SelectorTypes/Picker/Picker.utils';
import {batchActions} from 'redux-batched-actions';
import SiteSwitcher from '~/JContent/ContentNavigation/NavigationHeader/SwitchersLayout/SiteSwitcher';
import * as jcontentUtils from '~/JContent/JContent.utils';
import {configPropType} from '~/ContentEditor/SelectorTypes/Picker/configs/configPropType';
import PropTypes from 'prop-types';

const switcherSelector = state => ({
    siteKey: state.contenteditor.picker.site,
    currentLang: state.language
});

export const PickerSiteSwitcher = ({pickerConfig, accordionItemProps}) => {
    const state = useSelector(state => ({
        mode: state.contenteditor.picker.mode,
        openPaths: state.contenteditor.picker.openPaths
    }), shallowEqual);

    return (
        <SiteSwitcher selector={switcherSelector}
                      isSiteEnabled={pickerConfig?.pickerDialog?.isSiteEnabled}
                      onSelectAction={siteNode => {
                          const actions = [];
                          actions.push(cePickerSite(siteNode.name));
                          const accordionItems = jcontentUtils.getAccordionItems(pickerConfig.key, accordionItemProps)
                              .filter(accordionItem => !accordionItem.isEnabled || accordionItem.isEnabled(siteNode.name));
                          const selectedAccordion = accordionItems.find(item => item.key === state.mode) || accordionItems[0];
                          const newPath = selectedAccordion.getRootPath(siteNode.name);
                          actions.push(cePickerPath(newPath));
                          actions.push(cePickerMode(selectedAccordion.key));
                          actions.push(cePickerOpenPaths([...state.openPaths, ...getDetailedPathArray(newPath, siteNode.name)]));

                          return batchActions(actions);
                      }}
        />
    );
};

PickerSiteSwitcher.propTypes = {
    pickerConfig: configPropType.isRequired,
    accordionItemProps: PropTypes.object
};
