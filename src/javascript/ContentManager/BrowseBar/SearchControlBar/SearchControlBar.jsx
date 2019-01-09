import React from 'react';
import {Trans, translate} from 'react-i18next';
import {connect} from 'react-redux';
import {cmGoto, cmSetPath} from '../../redux/actions';
import {Button, Typography, withStyles} from '@material-ui/core';
import {Close, Search} from '@material-ui/icons';
import {compose} from 'react-apollo';
import * as _ from 'lodash';
import {VirtualsiteIcon} from '@jahia/icons';

const styles = theme => ({
    grow: {
        flex: 1
    },
    infoSearchPathValue: {
        color: theme.palette.text.primary
    }
});

export class SearchControlBar extends React.Component {
    render() {
        let {
            siteKey, path, setPath, t, classes, siteDisplayableName, clearSearch, searchContentType, sql2SearchFrom, sql2SearchWhere, searchTerms
        } = this.props;
        let siteRootPath = '/sites/' + siteKey;
        const params = {
            searchContentType: searchContentType,
            searchTerms: searchTerms,
            sql2SearchFrom: sql2SearchFrom,
            sql2SearchWhere: sql2SearchWhere
        };
        return (
            <React.Fragment>
                <Search fontSize="small"/>
                <Trans i18nKey="label.contentManager.search.searchPath"
                       values={{path: path}}
                >
                    <Typography key="searchPath" color="textSecondary">Searching under: </Typography><Typography key="searchPath" color="textPrimary">path</Typography>
                </Trans>

                <div className={classes.grow}/>

                {(path !== siteRootPath) &&
                <Button data-cm-role="search-all"
                        variant="contained"
                        size="small"
                        onClick={() => setPath(siteRootPath)}
                >
                    <VirtualsiteIcon/>
                    {t('label.contentManager.search.searchEverywhere', {site: siteDisplayableName})}
                </Button>
                }
                <Button data-cm-role="search-clear"
                        color="primary"
                        variant="contained"
                        size="small"
                        onClick={() => clearSearch(params)}
                >
                    <Close/>
                    {t('label.contentManager.search.clear')}
                </Button>

            </React.Fragment>
        );
    }
}

const mapStateToProps = state => {
    return {
        siteDisplayableName: state.siteDisplayableName,
        siteKey: state.site,
        path: state.path,
        searchTerms: state.params.searchTerms,
        searchContentType: state.params.searchContentType,
        sql2SearchFrom: state.params.sql2SearchFrom,
        sql2SearchWhere: state.params.sql2SearchWhere
    };
};

const mapDispatchToProps = dispatch => ({
    setPath: path => dispatch(cmSetPath(path)),
    clearSearch: params => {
        params = _.clone(params);
        _.unset(params, 'searchContentType');
        _.unset(params, 'searchTerms');
        _.unset(params, 'sql2SearchFrom');
        _.unset(params, 'sql2SearchWhere');
        dispatch(cmGoto({mode: 'browse', params: params}));
    }
});

export default compose(
    translate(),
    withStyles(styles),
    connect(mapStateToProps, mapDispatchToProps)
)(SearchControlBar);
