import React from 'react';
import {withStyles} from '@material-ui/core';
import {translate} from 'react-i18next';
import {compose} from 'react-apollo';
import CmSearchBarNormal from './CmSearchBarNormal';
import CmSearchBarSql2 from './CmSearchBarSql2';
import {connect} from 'react-redux';
import {cmSetSearchMode} from '../redux/actions';

const styles = () => ({
    topBar: {
        marginTop: '0px',
        alignItems: 'baseline'
    }
});

class CmSearchBar extends React.Component {
    render() {
        const {searchMode, setSearchMode, classes} = this.props;
        return (
            <div className={classes.topBar}>
                {(searchMode === 'normal') &&
                <CmSearchBarNormal onSql2Click={() => setSearchMode('sql2')}/>
                }
                {(searchMode === 'sql2') &&
                <CmSearchBarSql2 onNormalClick={() => setSearchMode('normal')}/>
                }
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    searchMode: state.searchMode
});

const mapDispatchToProps = (dispatch) => {
    return {
        setSearchMode: searchMode => dispatch(cmSetSearchMode(searchMode))
    };
};

export default compose(
    translate(),
    withStyles(styles),
    connect(mapStateToProps, mapDispatchToProps)
)(CmSearchBar);
