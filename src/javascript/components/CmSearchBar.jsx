import React from 'react';
import {withStyles, Typography, Button, Input, Paper, Grid, Tooltip} from '@material-ui/core';
import {Search} from '@material-ui/icons';
import ContentTypeSelect from './ContentTypeSelect';
import {translate, Trans} from 'react-i18next';
import {compose} from 'react-apollo';
import {DxContext} from './DxContext';
import {withNotifications} from '@jahia/react-material';
import {connect} from 'react-redux';
import {cmGoto, cmSetSearchMode} from './redux/actions';
import _ from 'lodash';

const styles = theme => ({
    sql2Form: {
        padding: theme.spacing.unit,
        color: theme.palette.background.default,
        fontFamily: 'monospace'
    },
    sql2Input: {
        margin: 0,
        padding: 0,
        width: 100,
        fontFamily: 'monospace'
    },
    footer: {
        display: 'flex',
        marginTop: theme.spacing.unit
    },
    actionButton: {
        textTransform: 'none',
        fontSize: '13px',
        marginTop: -7,
        padding: 0
    },
    link: {
        color: 'inherit'
    },
    topBar: {
        marginTop: '0px',
        alignItems: 'baseline'
    },
    iconSize: {
        fontSize: '20px'
    },
    searchSize: {
        height: '34px',
        maxHeight: '34px',
        minHeight: '34px',
        flexGrow: 10,
        boxShadow: 'none!important'
    },
    inputShadow: {
        boxShadow: 'none'
    },
    replaceButtonStyle: {
        minHeight: 32,
        maxHeight: 32,
        height: 32
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

class CmSearchBarNormal extends React.Component {
    constructor(props) {
        super(props);
        this.search = React.createRef();
        let {params} = this.props;
        this.state = {
            contentType: (params.searchContentType !== undefined ? params.searchContentType : null)
        };
    }

    onContentTypeChange(path, params, contentType) {
        this.setState({
            contentType: contentType
        });
        this.onSearch(path, params, contentType);
    }

    onSearchInputChange(path, params) {
        // Perform search only when the user has paused changing search terms for a second.
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(function () {
            this.onSearch(path, params, this.state.contentType);
        }.bind(this), 1000);
    }

    onSearchInputKeyDown(e, path, params) {
        if (e.key === 'Enter') {
            this.onSearch(path, params, this.state.contentType);
        }
    }

    onSearch(path, params, contentType) {
        let searchTerms = this.search.current ? this.search.current.value : params.searchTerms;
        if (!searchTerms) {
            return;
        }
        searchTerms = searchTerms.trim();
        if (searchTerms === '') {
            return;
        }

        params.searchTerms = searchTerms;
        if (contentType) {
            params.searchContentType = contentType;
        } else {
            _.unset(params, 'searchContentType');
        }

        this.props.search('search', path, params);
    }

    render() {
        let {onSql2Click, siteKey, path, params, classes, t} = this.props;

        return (
            <SearchBarLayout
                t={t}
                rightFooter={
                    <React.Fragment>
                        {!params.searchTerms ?
                            <ActionButton
                                label="label.contentManager.search.sql2"
                                cmRole="search-type-sql2search"
                                onClick={onSql2Click}
                            /> :
                            <div className={classes.replaceButtonStyle}/>
                        }
                    </React.Fragment>
                }
                onSearch={() => this.onSearch(path, params, this.state.contentType)}
            >
                <DxContext.Consumer className={classes.searchSize}>{dxContext => {
                    return (
                        <ContentTypeSelect
                            siteKey={siteKey}
                            displayLanguage={dxContext.uilang}
                            contentType={this.state.contentType}
                            onSelectionChange={contentType => this.onContentTypeChange(path, params, contentType)}
                        />
                    );
                }}
                </DxContext.Consumer>
                <Input
                    inputProps={{maxLength: 2000, 'data-cm-role': 'search-input-term'}}
                    className={classes.searchSize}
                    defaultValue={params.searchTerms}
                    classes={{input: classes.inputShadow}}
                    placeholder={t('label.contentManager.search.normalPrompt')}
                    inputRef={this.search}
                    onChange={() => this.onSearchInputChange(path, params)}
                    onKeyDown={e => this.onSearchInputKeyDown(e, path, params)}
                />
            </SearchBarLayout>
        );
    }
}

class CmSearchBarSql2 extends React.Component {
    constructor(props) {
        super(props);
        this.from = React.createRef();
        this.where = React.createRef();
    }

    onSearch(path, params) {
        params.sql2SearchFrom = this.from.current.value;
        if (this.where.current.value === '') {
            _.unset(params, 'sql2SearchWhere');
        } else {
            params.sql2SearchWhere = this.where.current.value;
        }

        this.props.search('sql2Search', path, params);
    }

    render() {
        let {onNormalClick, path, params, classes, t} = this.props;

        return (
            <SearchBarLayout t={t}
                leftFooter={<DxContext.Consumer>{dxContext => {
                    return (
                        <Trans
                            i18nKey="label.contentManager.search.sql2Prompt"
                            components={[<a key={this.id} href={dxContext.config.sql2CheatSheetUrl} target="_blank"
                                rel="noopener noreferrer" className={classes.link}>univers</a>]}
                        />
                    );
                }}
                </DxContext.Consumer>}
                rightFooter={<React.Fragment>
                    {!params.sql2SearchFrom ?
                        <ActionButton
                            label="label.contentManager.search.normal"
                            cmRole="search-type-normal"
                            onClick={onNormalClick}
                        /> :
                        <div className={classes.replaceButtonStyle}/>
                    }
                </React.Fragment>}
                onSearch={() => this.onSearch(path, params)}>
                <Grid container alignItems="center" classes={{container: classes.sql2Form}}>
                SELECT * FROM [
                    <Sql2Input
                        maxLength={100}
                        size={15}
                        defaultValue={params.sql2SearchFrom}
                        inputRef={this.from}
                        cmRole="sql2search-input-from"
                        onSearch={() => this.onSearch(path, params)}
                    />
                ] WHERE ISDESCENDANTNODE(&rsquo;{path}&rsquo;) AND (
                    <Sql2Input
                        maxLength={2000}
                        className={classes.inInput}
                        defaultValue={params.sql2SearchWhere}
                        inputRef={this.where}
                        cmRole="sql2search-input-where"
                        onSearch={() => this.onSearch(path, params)}
                    />
                )
                </Grid>
            </SearchBarLayout>
        );
    }
}

class Sql2Input extends React.Component {
    constructor(props) {
        super(props);
        this.onKeyDown = this.onKeyDown.bind(this);
    }

    onKeyDown(e) {
        if (e.key === 'Enter') {
            this.props.onSearch();
        }
    }

    render() {
        let {maxLength, size, defaultValue, inputRef, classes, style, cmRole} = this.props;

        return (
            <Input
                inputProps={{maxLength: maxLength, size: size, 'data-cm-role': cmRole}}
                defaultValue={defaultValue}
                inputRef={inputRef}
                classes={{root: classes.sql2Input, input: classes.sql2Input}}
                style={style}
                onKeyDown={e => this.onKeyDown(e)}
            />
        );
    }
}

class SearchBarLayout extends React.Component {
    render() {
        let {children, leftFooter, rightFooter, onSearch, classes, t} = this.props;

        return (
            <React.Fragment>
                <Paper square className={classes.searchSize}>
                    <Grid container wrap="nowrap" className={classes.searchSize}>
                        {children}
                        <Tooltip title={t('label.contentManager.search.search')}>
                            <Button color="primary" data-cm-role="search-submit" onClick={onSearch}>
                                <Search className={classes.iconSize}/>
                            </Button>
                        </Tooltip>
                    </Grid>
                </Paper>
                <Grid container>
                    <Grid item xs={8}>
                        <Typography gutterBottom color="inherit" align="left">
                            {leftFooter}
                        </Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Typography gutterBottom color="inherit" align="right">
                            {rightFooter}
                        </Typography>
                    </Grid>
                </Grid>
            </React.Fragment>
        );
    }
}

class ActionButton extends React.Component {
    render() {
        let {label, variant, onClick, classes, t, cmRole} = this.props;

        return (
            <Button variant={variant} size="small" classes={{root: classes.actionButton}} data-cm-role={cmRole} onClick={onClick}>
                {t(label)}
            </Button>
        );
    }
}

const mapStateToProps = (state) => ({
    siteKey: state.site,
    lang: state.language,
    path: state.path,
    searchMode: state.searchMode,
    params: state.params
});

const mapDispatchToProps = (dispatch) => {
    return {
        setSearchMode: searchMode => dispatch(cmSetSearchMode(searchMode)),
        search: (mode, path, params) => dispatch(cmGoto({mode, path, params}))
    };
};

compose(
    withNotifications(),
    translate(),
    withStyles(styles),
    connect(mapStateToProps, mapDispatchToProps)
)(CmSearchBarNormal);

compose(
    translate(),
    withStyles(styles),
    connect(mapStateToProps, mapDispatchToProps)
)(CmSearchBarSql2);

withStyles(styles)(Sql2Input);

withStyles(styles)(SearchBarLayout);

compose(
    translate(),
    withStyles(styles)
)(ActionButton);

compose(
    translate(),
    withStyles(styles),
    connect(mapStateToProps, mapDispatchToProps)
)(CmSearchBar);

export {CmSearchBar};
