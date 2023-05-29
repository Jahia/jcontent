import React, {useEffect, useState} from 'react';
import InputBase from '@material-ui/core/InputBase';
import {Button, Close, Search} from '@jahia/moonstone';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {cmGotoCatMan} from '~/JContent/redux/JContent.redux';
import JContentConstants from '~/JContent/JContent.constants';
import styles from './SearchInput.scss';

let timeOut;

const SearchInput = () => {
    const dispatch = useDispatch();
    const {searchTerms, searchPath} = useSelector(state => ({
        searchTerms: state.jcontent.params.searchTerms,
        searchPath: state.jcontent.params.searchPath
    }), shallowEqual);
    const [t, setT] = useState(searchTerms);

    // This updates component state when user changes search via dialog
    useEffect(() => {
        setT(searchTerms);
    }, [searchTerms, setT]);

    const performSearchDebounced = (time, value) => e => {
        clearTimeout(timeOut);
        const searchForValue = value === undefined ? e.target.value : value;
        setT(searchForValue);
        timeOut = setTimeout(() => {
            clearTimeout(timeOut);
            let mode = JContentConstants.mode.SEARCH;
            let searchParams;
            searchParams = {
                searchPath: searchPath,
                searchTerms: searchForValue,
                searchContentType: 'jnt:category'
            };

            dispatch(cmGotoCatMan({mode, params: searchParams}));
        }, time);
    };

    return (
        <div className={styles.searchInput}>
            <Button disabled variant="ghost" className={styles.iconButton} icon={<Search/>}/>
            <InputBase
                className={styles.input}
                value={t}
                inputProps={{'aria-label': 'search'}}
                onChange={performSearchDebounced(500)}
            />
            <Button variant="ghost" className={styles.iconButton} icon={<Close/>} onClick={performSearchDebounced(0, '')}/>
        </div>
    );
};

export default SearchInput;
