import React from "react";
import {translate} from 'react-i18next';
import {Link} from 'react-router-dom';
import {withNodesFromPath} from '@jahia/react-apollo';
import { Button, List, ListItem, ListItemText, ListItemIcon} from '@material-ui/core'
import * as _ from 'lodash';
import {Folder} from '@material-ui/icons';

class ContentBrowserView extends React.Component {

    render() {
        let {nodes, path, t} = this.props;
        let pathElements = _.reduce(_.split(path.substring(1), '/'), (result,value) => _.concat(result, result[result.length-1]+'/'+value), ['']);

        return (
            <List>
                    {nodes.map(n => {
                        return (
                            <ListItem key={n.uuid}>
                                <ListItemIcon>
                                    <Folder/>
                                </ListItemIcon>
                                <ListItemText><Link to={`${n.path}`}>{n.name}</Link></ListItemText>
                            </ListItem>
                        );
                    })}
            </List>
        );
    }
}

let ContentBrowserWithData = withNodesFromPath()(translate()(ContentBrowserView));

let ContentBrowser = (props) => {
    let path = props.match.url.substring(props.match.path.length - 2);
    return <ContentBrowserWithData path={path} types={['jnt:folder','jmix:list', 'jnt:virtualsite','jnt:virtualsitesFolder', 'jnt:page']}/>
};

export default ContentBrowser;