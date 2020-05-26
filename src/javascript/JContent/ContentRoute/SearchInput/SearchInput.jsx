import React, {useEffect, useState} from 'react';
import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import {CloseIcon, SearchIcon} from '@jahia/moonstone';
import {useDispatch, useSelector} from 'react-redux';
import {cmGoto} from '~/JContent/JContent.redux';
import JContentConstants from '../../JContent.constants';
import styles from './SearchInput.scss';

let timeOut;

const SearchInput = function () {
    const dispatch = useDispatch();
    const {searchTerms, searchContentType, searchPath} = useSelector(state => ({
        searchTerms: state.jcontent.params.searchTerms,
        searchPath: state.jcontent.params.searchPath,
        searchContentType: state.jcontent.params.searchContentType
    }));
    const [t, setT] = useState(searchTerms);
    // This updates component state when user changes search via dialog
    useEffect(() => {
        if (searchTerms !== t) {
            setT(searchTerms);
        }
    }, [searchTerms]);

    const performSearchDebounced = (time, value) => e => {
        clearTimeout(timeOut);
        const searchForValue = value !== undefined ? value : e.target.value;
        setT(searchForValue);
        timeOut = setTimeout(() => {
            clearTimeout(timeOut);
            let mode = JContentConstants.mode.SEARCH;
            let searchParams;
            searchParams = {
                searchPath: searchPath,
                searchTerms: searchForValue,
                searchContentType: searchContentType
            };

            dispatch(cmGoto({mode, params: searchParams}));
        }, time);
    };

    return (
        <div className={styles.searchInput}>
            <IconButton disabled className={styles.iconButton}>
                <SearchIcon/>
            </IconButton>
            <InputBase
                className={styles.input}
                value={t}
                inputProps={{'aria-label': 'search'}}
                onChange={performSearchDebounced(500)}
            />
            <IconButton className={styles.iconButton} onClick={performSearchDebounced(0, '')}>
                <CloseIcon/>
            </IconButton>
        </div>
    );
};

export default SearchInput;
