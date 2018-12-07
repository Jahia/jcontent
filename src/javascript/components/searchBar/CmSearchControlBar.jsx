import React from 'react';
import {translate, Trans} from 'react-i18next';
import {connect} from 'react-redux';
import {cmSetPath} from '../redux/actions';
import {Button, withStyles} from '@material-ui/core';
import {Search} from '@material-ui/icons';
import {compose} from 'react-apollo';

const styles = theme => ({
    infoSearchPath: {
        position: 'relative',
        fontSize: '14px',
        paddingTop: '10px',
        display: 'inline-block',
        bottom: '5px',
        color: theme.palette.text.secondary,
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit
    },
    infoSearchPathValue: {
        color: theme.palette.text.primary
    },
    searchClear: {
        maxHeight: 25,
        minHeight: 25,
        marginLeft: '18'
    },
    searchIcon: {
        marginLeft: theme.spacing.unit,
        fontSize: '20',
        color: theme.palette.text.disabled
    },
    container: {
        display: 'flex',
        alignItems: 'center'
    }
});

class CmSearchControlBar extends React.Component {
    render() {
        let {siteKey, path, setPath, t, classes, siteDisplayableName} = this.props;
        let siteRootPath = '/sites/' + siteKey;

        return (
            <div className={classes.container}>
                <div>
                    <Search className={classes.searchIcon}/>
                    <div className={classes.infoSearchPath}>
                        <Trans i18nKey="label.contentManager.search.searchPath"
                               values={{path: path}}
                               components={[<span key="searchPath" className={classes.infoSearchPathValue}>univers</span>]}
                        />
                    </div>
                </div>
                <div>
                    {(path !== siteRootPath) &&
                    <Button variant="contained"
                            classes={{sizeSmall: classes.searchClear}}
                            size="small"
                            onClick={() => setPath(siteRootPath)}
                    >
                        {t('label.contentManager.search.searchEverywhere', {site: siteDisplayableName})}
                    </Button>
                    }
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        siteDisplayableName: state.siteDisplayableName,
        siteKey: state.site,
        path: state.path
    };
};

const mapDispatchToProps = dispatch => ({
    setPath: path => dispatch(cmSetPath(path))
});

export default compose(
    translate(),
    withStyles(styles),
    connect(mapStateToProps, mapDispatchToProps)
)(CmSearchControlBar);
