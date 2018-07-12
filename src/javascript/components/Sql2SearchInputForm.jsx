import React from "react";
import {withStyles, Input, Paper, Button, Collapse} from "@material-ui/core";
import {ExpandLess, ExpandMore} from '@material-ui/icons';
import {translate} from 'react-i18next';
import {compose} from "react-apollo/index";

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
        this.orderBy = React.createRef();
    }

    onExpandCollapseClick = () => {
        this.setState({
            open: !this.state.open
        });
    }

    onSearchClick = () => {
        this.props.onSql2Search(this.from.current.value, this.where.current.value, this.orderBy.current.value);
    }

    render() {

        let {siteKey, classes, t} = this.props;

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
                                select * from [<Sql2Input maxLength={50} size={20} inputRef={this.from}/>] where ISDESCENDANTNODE('/sites/{siteKey}')
                            </div>
                            <div>
                                and (<Sql2Input maxLength={500} size={80} inputRef={this.where}/>)
                            </div>
                            <div>
                                order by [<Sql2Input maxLength={50} size={20} defaultValue={'jcr:uuid'} inputRef={this.orderBy}/>]
                            </div>
                        </div>
                        <div className={classes.actions}>
                            <Button size={'small'} onClick={this.onSearchClick}>{t('label.contentManager.search')}</Button>
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