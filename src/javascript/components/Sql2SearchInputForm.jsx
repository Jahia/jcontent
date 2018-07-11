import React from "react";
import {withStyles, Input, Paper, FormControl, Button} from "@material-ui/core";
import {translate} from 'react-i18next';
import {compose} from "react-apollo/index";

const styles = theme => ({
    root: {
        margin: theme.spacing.unit,
        padding: theme.spacing.unit,
        color: theme.palette.text.secondary,
        fontFamily: 'monospace'
    },
    sql2Control : {
        width: 'auto'
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
        this.from = React.createRef();
        this.where = React.createRef();
        this.orderBy = React.createRef();
    }

    onSearchClicked = () => {
        alert(this.from.current.value);
        alert(this.where.current.value);
        alert(this.orderBy.current.value);
    }

    render() {

        let {siteKey, classes, t} = this.props;

        return (
            <Paper classes={{root: classes.root}}>
                <div>
                    select * from [<Sql2Input required maxLength={50} size={20} inputRef={this.from}/>] as node where ISDESCENDANTNODE(node, {`'/sites/${siteKey}'`})
                </div>
                <div>
                    and (<Sql2Input maxLength={500} size={80} inputRef={this.where}/>)
                </div>
                <div>
                    order by [<Sql2Input required maxLength={50} size={20} inputRef={this.orderBy}/>]
                </div>
                <div className={classes.actions}>
                    <Button size={'small'} onClick={this.onSearchClicked}>{t('label.contentManager.search')}</Button>
                </div>
            </Paper>
        );
    }
}

class Sql2Input extends React.Component {

    render() {

        let {required, maxLength, size, inputRef, classes} = this.props;

        return (
            <FormControl required={required} classes={{root: classes.sql2Control}}>
                <Input inputProps={{maxLength: maxLength, size: size}} inputRef={inputRef} classes={{root: classes.sql2Input, input: classes.sql2Input}}/>
            </FormControl>
        );
    }
}

Sql2Input = withStyles(styles)(Sql2Input);

Sql2SearchInputForm = compose(
    translate(),
    withStyles(styles)
)(Sql2SearchInputForm);

export default Sql2SearchInputForm;