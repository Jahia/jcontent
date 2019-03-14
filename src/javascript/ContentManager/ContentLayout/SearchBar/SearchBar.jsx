import React from 'react';
import PropTypes from 'prop-types';
import {translate} from 'react-i18next';
import {compose} from 'react-apollo';
import SearchBarNormal from './SearchBarNormal';
import SearchBarSql2 from './SearchBarSql2';
import {connect} from 'react-redux';
import {cmSetSearchMode} from '../../ContentManager.redux-actions';

export class SearchBar extends React.Component {
    render() {
        const {searchMode, setSearchMode} = this.props;
        return (
            <React.Fragment>
                {(searchMode === 'normal') &&
                <SearchBarNormal onSql2Click={() => setSearchMode('sql2')}/>
                }
                {(searchMode === 'sql2') &&
                <SearchBarSql2 onNormalClick={() => setSearchMode('normal')}/>
                }
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => ({
    searchMode: state.searchMode
});

const mapDispatchToProps = dispatch => {
    return {
        setSearchMode: searchMode => dispatch(cmSetSearchMode(searchMode))
    };
};

SearchBar.propTypes = {
    searchMode: PropTypes.string.isRequired,
    setSearchMode: PropTypes.func.isRequired
};

export default compose(
    translate(),
    connect(mapStateToProps, mapDispatchToProps)
)(SearchBar);
