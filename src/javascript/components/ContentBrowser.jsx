import React from "react";
import {translate} from 'react-i18next';
import {Link} from 'react-router-dom';
import {withNodesFromPath} from '@jahia/react-apollo';
import {Grid, Paper, Table, TableBody, TableCell, TableHead, TableRow, Button} from '@material-ui/core'
import * as _ from 'lodash';
import ContentBreadcrumbs from './ContentBreadcrumbs';
import ContentPreview from './ContentPreview';

class ContentBrowserView extends React.Component {

    render() {
        let {nodes, path, t} = this.props;
        let pathElements = _.reduce(_.split(path.substring(1), '/'), (result,value) => _.concat(result, result[result.length-1]+'/'+value), ['']);

        return (
            <Paper elevation={1}>
                <Grid container>
                    <Grid item xs={12}>
                        <ContentBreadcrumbs path={path}/>
                    </Grid>
                    <Grid item xs={8}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>{t('label.contentmanager.nodeName')}</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {nodes.map(n => {
                                    return (
                                        <TableRow key={n.uuid}>
                                            <TableCell><Link to={`${n.path}`}>{n.name}</Link></TableCell>
                                            <TableCell><Button onClick={(event) => window.parent.editContent(n.path, n.name, ['jnt:content'], ['nt:base'])}>{t('label.contentmanager.editAction')}</Button></TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </Grid>
                    <Grid item xs={4}>
                        <ContentPreview/>
                    </Grid>
                </Grid>
            </Paper>);
    }
}

let ContentBrowserWithData = withNodesFromPath()(translate()(ContentBrowserView));

let ContentBrowser = (props) => {
    let path = props.match.url.substring(props.match.path.length - 2);
    return <ContentBrowserWithData path={path} types={['jnt:content', 'jnt:virtualsite','jnt:virtualsitesFolder', 'jnt:page']}/>
};

export default ContentBrowser;