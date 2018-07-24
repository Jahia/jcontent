import React from "react";
import {withStyles, Button, Input, Paper, IconButton, Grid} from "@material-ui/core";
import Search from '@material-ui/icons/Search';
import ContentTypeSelect from './ContentTypeSelect';
import {translate} from 'react-i18next';
import {compose} from "react-apollo/index";
import CmRouter from "./CmRouter";

const styles = theme => ({
    sql2Form: {
        padding: theme.spacing.unit,
        color: theme.palette.text.secondary,
        fontFamily: 'monospace'
    },
    sql2Input : {
        margin: 0,
        padding: 0,
        fontFamily: 'monospace'
    },
    footer: {
        display: 'flex',
        marginTop: theme.spacing.unit
    },
    footerLeft: {
        marginRight: 'auto',
        // The same padding/font as small buttons on the left of the footer
        padding: '7px 8px',
        fontSize: theme.typography.pxToRem(13)
    },
    footerRight: {
        marginLeft: 'auto'
    },
    actionButton: {
        textTransform: 'none'
    }
});

class CmSearchBar extends React.Component {

    constructor(props) {

        super(props);

        this.onSql2Click = this.onSql2Click.bind(this);
        this.onNormalClick = this.onNormalClick.bind(this);
        this.onClear = this.onClear.bind(this);

        let normal = <CmSearchBarNormal dxContext={props.dxContext} onSql2Click={this.onSql2Click}/>;
        let sql2 = <CmSearchBarSql2 siteKey={props.dxContext.siteKey} from={props.sql2SearchFrom} where={props.sql2SearchWhere} onNormalClick={this.onNormalClick} onClear={this.onClear}/>;
        this.state = {
            normal: normal,
            sql2: sql2,
            current: (props.sql2SearchFrom ? sql2 : normal)
        };
    }

    onSql2Click() {
        this.setState({
            current: this.state.sql2
        });
    }

    onNormalClick() {
        this.setState({
            current: this.state.normal
        });
    }

    onClear(goto) {
        goto('/browse');
    }

    render() {
        return (
            <div>
                {this.state.current}
            </div>
        )
    }
}

class CmSearchBarNormal extends React.Component {

    onSearch(goto) {
    }

    render() {

        let {dxContext, onSql2Click, classes, t} = this.props;

        return (
            <CmRouter render={({params, goto}) => (
                <SearchBarLayout onSearch={() => this.onSearch(goto)}
                    rightFooter={
                        <ActionButton label={'label.contentManager.search.sql2'} onClick={onSql2Click}/>
                    }
                >
                    <ContentTypeSelect siteKey={dxContext.siteKey} displayLanguage={dxContext.uilang}/>
                    <Input inputProps={{maxLength: 2000}} placeholder={t('label.contentManager.search.normalPrompt')} style={{flexGrow: 10}}/>
                </SearchBarLayout>
            )}/>
        );
    }
}

class CmSearchBarSql2 extends React.Component {

    constructor(props) {
        super(props);
        this.from = React.createRef();
        this.where = React.createRef();
    }

    onSearch(goto) {
        goto('/sql2Search', (this.where.current.value !== "") ? {
            sql2SearchFrom: this.from.current.value,
            sql2SearchWhere: this.where.current.value
        } : {
            sql2SearchFrom: this.from.current.value
        });
    }

    onClear(goto) {
        this.from.current.value = '';
        this.where.current.value = '';
        this.props.onClear(goto);
    }

    render() {

        let {siteKey, from, where, onNormalClick, classes, t} = this.props;

        return (
            <CmRouter render={({params, goto}) => (
                <SearchBarLayout onSearch={() => this.onSearch(goto)}
                    leftFooter={
                        t('label.contentManager.search.sql2Propmt')
                    }
                    rightFooter={
                        <div>
                            {params.sql2SearchFrom &&
                                <ActionButton label={'label.contentManager.search.clear'} variant={'contained'} onClick={() => this.onClear(goto)}/>
                            }
                            {!params.sql2SearchFrom &&
                                <ActionButton label={'label.contentManager.search.normal'} onClick={onNormalClick}/>
                            }
                        </div>
                    }
                >
                    <Grid container alignItems={'center'} classes={{container: classes.sql2Form}}>
                        SELECT * FROM [
                        <Sql2Input maxLength={100} size={15} defaultValue={from} inputRef={this.from} onSearch={() => this.onSearch(goto)} cmRole={'sql2search-input-from'}/>
                        ] WHERE ISDESCENDANTNODE('/sites/{siteKey}') AND (
                        <Sql2Input maxLength={2000} style={{flexGrow: 10}} defaultValue={where} inputRef={this.where} onSearch={() => this.onSearch(goto)} cmRole={'sql2search-input-where'}/>
                        )
                    </Grid>
                </SearchBarLayout>
            )}/>
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
                onKeyDown={(e) => this.onKeyDown(e)}
            />
        );
    }
}

class SearchBarLayout extends React.Component {

    render() {

        let {children, leftFooter, rightFooter, onSearch, classes} = this.props;

        return (
            <div>
                <Paper square>
                    <Grid container wrap={'nowrap'}>
                        {children}
                        <IconButton color={'secondary'} onClick={onSearch}>
                            <Search/>
                        </IconButton>
                    </Grid>
                </Paper>
                <div className={classes.footer}>
                    <span className={classes.footerLeft}>
                        {leftFooter}
                    </span>
                    <span className={classes.footerRight}>
                        {rightFooter}
                    </span>
                </div>
            </div>
        )
    }
}

class ActionButton extends React.Component {

    render() {

        let {label, variant, onClick, classes, t} = this.props;

        return (
            <Button variant={variant} size={'small'} onClick={onClick} classes={{root: classes.actionButton}}>
                {t(label)}
            </Button>
        );
    }
}

CmSearchBarNormal = compose(
    translate(),
    withStyles(styles)
)(CmSearchBarNormal);

CmSearchBarSql2 = compose(
    translate(),
    withStyles(styles)
)(CmSearchBarSql2);

Sql2Input = withStyles(styles)(Sql2Input);

SearchBarLayout = withStyles(styles)(SearchBarLayout);

ActionButton = compose(
    translate(),
    withStyles(styles)
)(ActionButton);

CmSearchBar = compose(
    translate(),
    withStyles(styles)
)(CmSearchBar);

export {CmSearchBar};