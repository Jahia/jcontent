import React, {useRef, useState} from 'react';
import {Dropdown, SearchContextInput} from '@jahia/moonstone';
import styles from './Search.scss';
import {cePickerSetSearchPath, cePickerSetSearchTerm} from '~/ContentEditor/SelectorTypes/Picker/Picker.redux';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {registry} from '@jahia/ui-extender';
import {useQuery} from '@apollo/client';
import {batchActions} from 'redux-batched-actions';
import {Constants} from '~/ContentEditor/SelectorTypes/Picker/Picker.constants';
import {getBaseSearchContextData} from '~/ContentEditor/SelectorTypes/Picker/Picker.utils';
import {GET_SEARCH_CONTEXT} from '../JahiaPicker.gql-queries';
import PropTypes from 'prop-types';
import * as jcontentUtils from '~/JContent/JContent.utils';

export const Search = ({accordionItemProps}) => {
    const {t} = useTranslation('jcontent');
    const dispatch = useDispatch();
    const [searchValue, setSearchValue] = useState('');
    const timeout = useRef(null);
    const {searchPath, preSearchModeMemo, currentPath, currentSite, language, uilang, mode} = useSelector(state => ({
        mode: state.contenteditor.picker.mode,
        searchPath: state.contenteditor.picker.searchPath,
        preSearchModeMemo: state.contenteditor.picker.preSearchModeMemo,
        currentPath: state.contenteditor.picker.path,
        currentSite: state.contenteditor.picker.site ? state.contenteditor.picker.site : state.site,
        language: state.language,
        uilang: state.uilang
    }), shallowEqual);

    const {data} = useQuery(GET_SEARCH_CONTEXT, {
        variables: {
            paths: [currentPath], language: language, uilang
        }
    });

    const node = data && data.jcr.nodesByPath[0];

    const handleChangeContext = (e, item) => {
        dispatch(cePickerSetSearchPath(item.searchPath));
    };

    const previousMode = mode === Constants.mode.SEARCH ? preSearchModeMemo : mode;

    const handleChangeTerms = e => {
        const v = e.target.value;
        setSearchValue(v);

        if (v === '') {
            handleClearTerms();
        } else if (v.length >= 3) {
            clearTimeout(timeout.current);
            timeout.current = setTimeout(() => {
                clearTimeout(timeout.current);
                dispatch(batchActions([
                    cePickerSetSearchPath(searchPath === '' ? currentPath : searchPath),
                    cePickerSetSearchTerm(v)
                ]));
            }, 300);
        }
    };

    const handleClearTerms = () => {
        setSearchValue('');
        dispatch(batchActions([
            cePickerSetSearchTerm(''),
            cePickerSetSearchPath(currentPath)
        ]));
    };

    const accordion = jcontentUtils.getAccordionItem(registry.get('accordionItem', previousMode), accordionItemProps);
    const getSearchContextData = accordion.getSearchContextData || getBaseSearchContextData;
    const searchContextData = getSearchContextData({t, currentSite, accordion, node, currentPath});

    const currentSearchContext = searchContextData.find(value => value.searchPath === (searchPath === '' ? currentPath : searchPath)) || searchContextData[0];

    return (
        <SearchContextInput
            searchContext={<Dropdown data={searchContextData}
                                     value={currentSearchContext.searchPath}
                                     label={currentSearchContext.label}
                                     icon={currentSearchContext.iconStart}
                                     onChange={handleChangeContext}/>}
            size="big"
            value={searchValue}
            className={styles.searchInput}
            onChange={e => handleChangeTerms(e)}
            onClear={e => handleClearTerms(e)}
        />
    );
};

Search.propTypes = {
    accordionItemProps: PropTypes.object
};
