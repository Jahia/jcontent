import React, {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import {cmGoto} from '~/JContent/JContent.redux';
import JContentConstants from '~/JContent/JContent.constants';
import SearchDialog from './SearchDialog';

const SearchDialogContainer = ({isOpen, handleClose}) => {
    const dispatch = useDispatch();

    const {params, mode, path} = useSelector(state => ({
        params: state.jcontent.params,
        mode: state.jcontent.mode,
        path: state.jcontent.path
    }));

    const [isAdvancedSearch, setIsAdvancedSearch] = useState(mode === JContentConstants.mode.SQL2SEARCH);
    const [searchPath, setSearchPath] = useState(searchPath ? searchPath : (params.searchPath ? params.searchPath : path));
    const [searchTerms, setSearchTerms] = useState(searchTerms ? searchTerms : (params.searchTerms ? params.searchTerms : ''));
    const [searchContentType, setSearchContentType] = useState(searchContentType ? searchContentType : (params.searchContentType ? params.searchContentType : ''));

    const handleSearchChanges = (key, value) => {
        if (key === 'searchPath') {
            setSearchPath(value);
        }

        if (key === 'searchTerms') {
            setSearchTerms(value);
        }

        if (key === 'searchContentType') {
            setSearchContentType(value);
        }
    };

    const performSearch = () => {
        let mode;
        let searchParams;
        if (isAdvancedSearch) {
            searchParams = {};
            mode = JContentConstants.mode.SQL2SEARCH;
        } else {
            searchParams = {
                searchPath: searchPath,
                searchTerms: searchTerms,
                searchContentType: searchContentType
            };
            mode = JContentConstants.mode.SEARCH;
        }

        dispatch(cmGoto({mode, params: searchParams}));
        handleClose();
    };

    const toggleAdvancedSearch = () => {
        setIsAdvancedSearch(!isAdvancedSearch);
    };

    return (
        <SearchDialog searchPath={searchPath}
                      searchTerms={searchTerms}
                      searchContentType={searchContentType}
                      isOpen={isOpen}
                      isAdvancedSearch={isAdvancedSearch}
                      toggleAdvancedSearch={toggleAdvancedSearch}
                      performSearch={performSearch}
                      handleSearchChanges={handleSearchChanges}
                      handleClose={handleClose}/>
    );
};

SearchDialogContainer.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired
};

export default SearchDialogContainer;
