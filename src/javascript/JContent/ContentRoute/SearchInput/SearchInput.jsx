import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@jahia/moonstone/dist/icons/Search';
import CloseIcon from '@jahia/moonstone/dist/icons/Close';
import {useDispatch, useSelector} from 'react-redux';
import {cmGoto} from '~/JContent/JContent.redux';
import JContentConstants from '../../JContent.constants';
import styles from './SearchInput.scss';

let timeOut;

const SearchInput = function ({clearSearch}) {
    const dispatch = useDispatch();
    const {searchTerms, searchContentType, searchPath} = useSelector(state => ({
        searchTerms: state.jcontent.params.searchTerms,
        searchPath: state.jcontent.params.searchPath,
        searchContentType: state.jcontent.params.searchContentType
    }));
    const [t, setT] = useState(searchTerms);
    // This updates component state when use changes search via dialog
    useEffect(() => {
        if (searchTerms !== t) {
            setT(searchTerms);
        }
    }, [searchTerms, t]);

    const performSearchDebounced = e => {
        clearTimeout(timeOut);
        const st = e.target.value;
        setT(st);
        timeOut = setTimeout(() => {
            clearTimeout(timeOut);
            let mode = JContentConstants.mode.SEARCH;
            let searchParams;
            searchParams = {
                searchPath: searchPath,
                searchTerms: st,
                searchContentType: searchContentType
            };

            dispatch(cmGoto({mode, params: searchParams}));
        }, 500);
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
                onChange={performSearchDebounced}
            />
            <IconButton className={styles.iconButton} onClick={clearSearch}>
                <CloseIcon/>
            </IconButton>
        </div>
    );
};

SearchInput.propTypes = {
    clearSearch: PropTypes.func.isRequired
};

export default SearchInput;
