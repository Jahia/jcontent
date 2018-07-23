import React from "react";
import {withStyles, Button, Input, Paper, IconButton} from "@material-ui/core";
import Search from '@material-ui/icons/Search';
import ContentTypeSelect from './ContentTypeSelect';
import {SearchBar} from '@jahia/react-material';
import {translate} from 'react-i18next';
import {compose} from "react-apollo/index";
import CmRouter from "./CmRouter";

const styles = theme => ({
    sql2Form: {
        paddingLeft: theme.spacing.unit,
        color: theme.palette.text.secondary,
        fontFamily: 'monospace'
    },
    sql2Input : {
        margin: 0,
        padding: 0,
        fontFamily: 'monospace'
    },
    footer: {
        display: 'flex'
    },
    footerLeft: {
        marginRight: 'auto',
        padding: theme.spacing.unit
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

    render() {

        let {dxContext, classes, t} = this.props;

        return (
            <div>
                <div>
                    <ContentTypeSelect siteKey={dxContext.siteKey} displayLanguage={dxContext.uilang}/>
                    <SearchBar placeholderLabel={t('label.contentManager.search.normalPrompt')} onChangeFilter={""} onFocus={""} onBlur={""}/>
                </div>
                <div className={classes.footer}>
                    <FooterSection className={classes.footerRight}>
                        <ActionButton label={'label.contentManager.search.sql2'} onClick={this.props.onSql2Click}/>
                    </FooterSection>
                </div>
            </div>
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

        let {siteKey, from, where, classes, t} = this.props;

        return (
            <CmRouter render={({params, goto}) => (
                <div>
                    <Paper classes={{root: classes.sql2Form}}>
                        SELECT * FROM [
                        <Sql2Input maxLength={100} size={15} defaultValue={from} inputRef={this.from} onSearch={() => this.onSearch(goto)} cmRole={'sql2search-input-from'}/>
                        ] WHERE ISDESCENDANTNODE('/sites/{siteKey}') AND (
                        <Sql2Input maxLength={2000} size={50} defaultValue={where} inputRef={this.where} onSearch={() => this.onSearch(goto)} cmRole={'sql2search-input-where'}/>
                        )
                        <IconButton color={'secondary'} onClick={() => this.onSearch(goto)}>
                            <Search/>
                        </IconButton>
                    </Paper>
                    <div className={classes.footer}>
                        <FooterSection className={classes.footerLeft}>
                            {t('label.contentManager.search.sql2Propmt')}
                        </FooterSection>
                        <FooterSection className={classes.footerRight}>
                            {params.sql2SearchFrom &&
                                <ActionButton label={'label.contentManager.search.clear'} onClick={() => this.onClear(goto)}/>
                            }
                            {!params.sql2SearchFrom &&
                                <ActionButton label={'label.contentManager.search.normal'} onClick={this.props.onNormalClick}/>
                            }
                        </FooterSection>
                    </div>
                </div>
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

        let {maxLength, size, defaultValue, inputRef, classes, cmRole} = this.props;

        return (
            <Input
                inputProps={{maxLength: maxLength, size: size, 'data-cm-role': cmRole}}
                defaultValue={defaultValue}
                inputRef={inputRef}
                classes={{root: classes.sql2Input, input: classes.sql2Input}}
                onKeyDown={(e) => this.onKeyDown(e)}
            />
        );
    }
}

class FooterSection extends React.Component {

    render() {

        let {children, className} = this.props;

        return (
            <span className={className}>
                {children}
            </span>
        );
    }
}

class ActionButton extends React.Component {

    render() {

        let {label, onClick, classes, t} = this.props;

        return (
            <Button size={'small'} onClick={onClick} classes={{root: classes.actionButton}}>
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

FooterSection = withStyles(styles)(FooterSection);

ActionButton = compose(
    translate(),
    withStyles(styles)
)(ActionButton);

CmSearchBar = compose(
    translate(),
    withStyles(styles)
)(CmSearchBar);

export {CmSearchBar};