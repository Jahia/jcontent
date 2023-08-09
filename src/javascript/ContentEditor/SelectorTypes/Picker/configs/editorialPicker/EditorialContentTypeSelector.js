import {cePickerSetPage, cePickerSetTableViewType} from '~/ContentEditor/SelectorTypes/Picker/Picker.redux';
import React from 'react';
import {ContentTypeSelector as JContentTypeSelector} from '~/JContent/ContentRoute/ContentLayout/ContentTable';
import {configPropType} from '~/ContentEditor/SelectorTypes/Picker/configs/configPropType';

export const EditorialContentTypeSelector = ({pickerConfig}) => {
    const selectableTypesTable = pickerConfig.selectableTypesTable || [];

    const selector = state => ({
        mode: state.contenteditor.picker.mode,
        siteKey: state.site,
        path: state.contenteditor.picker.path,
        lang: state.language,
        uilang: state.uilang,
        selectableTypesTable: selectableTypesTable,
        pagination: state.contenteditor.picker.pagination,
        sort: state.contenteditor.picker.sort,
        tableView: state.contenteditor.picker.tableView
    });

    const reduxActions = {
        setPageAction: page => cePickerSetPage(page),
        setTableViewTypeAction: view => cePickerSetTableViewType(view)
    };

    const canSelectPages = selectableTypesTable.includes('jnt:page');

    return canSelectPages && <JContentTypeSelector selector={selector} reduxActions={reduxActions}/>;
};

EditorialContentTypeSelector.propTypes = {
    pickerConfig: configPropType
};
