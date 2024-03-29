import React, {useEffect, useState} from 'react';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import {cmGoto, cmPreSearchModeMemo, setTableViewMode} from '~/JContent/redux/JContent.redux';
import JContentConstants from '~/JContent/JContent.constants';
import SearchDialog from './SearchDialog';
import {batchActions} from 'redux-batched-actions';

const SearchDialogContainer = ({isOpen, handleClose, defaultContentType, isShowingOnlySearchInput}) => {
    const dispatch = useDispatch();

    const {params, mode, path} = useSelector(state => ({
        params: state.jcontent.params,
        mode: state.jcontent.mode,
        path: state.jcontent.path
    }), shallowEqual);

    useEffect(() => {
        if (mode !== JContentConstants.mode.SQL2SEARCH && mode !== JContentConstants.mode.SEARCH) {
            dispatch(cmPreSearchModeMemo(mode));
        }
    }, [mode, dispatch]);

    const [isAdvancedSearch, setIsAdvancedSearch] = useState(mode === JContentConstants.mode.SQL2SEARCH);
    const [searchPath, setSearchPath] = useState(params.searchPath ? params.searchPath : path);
    const [searchTerms, setSearchTerms] = useState(params.searchTerms ? params.searchTerms : '');
    const [searchContentType, setSearchContentType] = useState(params.searchContentType ? params.searchContentType : defaultContentType);
    const [sql2SearchFrom, setSql2SearchFrom] = useState(params.sql2SearchFrom ? params.sql2SearchFrom : '');
    const [sql2SearchWhere, setSql2SearchWhere] = useState(params.sql2SearchWhere ? params.sql2SearchWhere : '');

    useEffect(() => {
        setSearchPath(params.searchPath ? params.searchPath : path);
    }, [params.searchPath, path]);

    const searchForm = {
        searchPath,
        searchTerms,
        searchContentType,
        sql2SearchFrom,
        sql2SearchWhere
    };

    const searchFormSetters = {
        setSearchPath,
        setSearchTerms,
        setSearchContentType,
        setSql2SearchFrom,
        setSql2SearchWhere
    };

    const performSearch = () => {
        let mode;
        let searchParams;
        if (isAdvancedSearch) {
            searchParams = {
                searchPath: searchPath,
                sql2SearchFrom: sql2SearchFrom,
                sql2SearchWhere: sql2SearchWhere
            };
            mode = JContentConstants.mode.SQL2SEARCH;
        } else {
            searchParams = {
                searchPath: searchPath,
                searchTerms: searchTerms,
                searchContentType: searchContentType
            };
            mode = JContentConstants.mode.SEARCH;
        }

        dispatch(batchActions([
            cmGoto({mode, params: searchParams}),
            setTableViewMode('flatList')
        ]));

        handleClose();
    };

    const toggleAdvancedSearch = () => {
        setIsAdvancedSearch(!isAdvancedSearch);
    };

    return (
        <SearchDialog searchForm={searchForm}
                      searchFormSetters={searchFormSetters}
                      isOpen={isOpen}
                      isAdvancedSearch={isAdvancedSearch}
                      toggleAdvancedSearch={toggleAdvancedSearch}
                      performSearch={performSearch}
                      handleClose={handleClose}
                      isShowingOnlySearchInput={isShowingOnlySearchInput}/>
    );
};

SearchDialogContainer.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    defaultContentType: PropTypes.string,
    isShowingOnlySearchInput: PropTypes.bool
};

SearchDialogContainer.defaultProps = {
    defaultContentType: '',
    isShowingOnlySearchInput: false
};

export default SearchDialogContainer;
