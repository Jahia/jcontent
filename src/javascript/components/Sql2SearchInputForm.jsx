import React from "react";
import {withStyles, Input, Paper, Button, Collapse} from "@material-ui/core";
import {ExpandLess, ExpandMore} from '@material-ui/icons';
import {translate} from 'react-i18next';
import {compose} from "react-apollo/index";
import CmRouter from "./CmRouter";
import {
    NODE_TYPE_OPEN, NODE_TYPE_CLOSE,
    BELONGS_TO_SITE_OPEN, BELONGS_TO_SITE_CLOSE,
    ADDITIONAL_CONDITION_OPEN, ADDITIONAL_CONDITION_CLOSE
} from "./sql2SearchUtils.js";

const styles = theme => ({
    root: {
        marginTop: theme.spacing.unit,
    },
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
    actions: {
        textAlign: 'right'
    }
});

class Sql2SearchInputForm extends React.Component {

    constructor(props) {

        super(props);

        this.state = {
            open: false
        }

        this.from = React.createRef();
        this.where = React.createRef();
    }

    onExpandCollapseClick = () => {
        this.setState({
            open: !this.state.open
        });
    }

    onSearchClick = (goto) => {
        goto('/sql2Search', {
            from: this.from.current.value,
            where: this.where.current.value
        });
    }

    onQuitClick = (goto) => {
        goto('/browse');
    }

    render() {

        let {siteKey, showQuitButton, classes, t} = this.props;

        return (
            <div className={classes.root}>
                <Button onClick={this.onExpandCollapseClick}>
                    {t('label.contentManager.sql2Search')}
                    {this.state.open ? <ExpandLess/> : <ExpandMore/>}
                </Button>
                <Collapse in={this.state.open}>
                    <Paper classes={{root: classes.sql2Form}}>
                        <div>
                            <div>
                                {NODE_TYPE_OPEN}<Sql2Input maxLength={50} size={20} inputRef={this.from}/>{NODE_TYPE_CLOSE} {BELONGS_TO_SITE_OPEN}{siteKey}{BELONGS_TO_SITE_CLOSE}
                            </div>
                            <div>
                                {ADDITIONAL_CONDITION_OPEN}<Sql2Input maxLength={500} size={80} inputRef={this.where}/>{ADDITIONAL_CONDITION_CLOSE}
                            </div>
                        </div>
                        <div className={classes.actions}>
                            <CmRouter render={ ({goto}) => (
                                <div>
                                    <Button size={'small'} onClick={() => this.onSearchClick(goto)}>{t('label.contentManager.search')}</Button>
                                    {
                                        showQuitButton &&
                                        <Button size={'small'} onClick={() => this.onQuitClick(goto)}>{t('label.contentManager.quitSearch')}</Button>
                                    }
                                </div>
                            )}/>
                        </div>
                    </Paper>
                </Collapse>
            </div>
        );
    }
}

class Sql2Input extends React.Component {

    render() {

        let {maxLength, size, defaultValue, inputRef, classes} = this.props;

        return (
            <Input inputProps={{maxLength: maxLength, size: size}} defaultValue={defaultValue} inputRef={inputRef} classes={{root: classes.sql2Input, input: classes.sql2Input}}/>
        );
    }
}

Sql2Input = withStyles(styles)(Sql2Input);

Sql2SearchInputForm = compose(
    translate(),
    withStyles(styles)
)(Sql2SearchInputForm);

export default Sql2SearchInputForm;