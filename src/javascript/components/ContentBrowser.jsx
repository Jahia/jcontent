import React from "react";
import {translate} from 'react-i18next';
import {withNodesFromPath} from '@jahia/react-apollo';
import { List, ListItem, ListItemText, ListItemIcon} from '@material-ui/core'
import * as _ from 'lodash';
import {Folder} from '@material-ui/icons';
import {compose} from "react-apollo";
import CmLink from "./CmLink";

class ContentBrowserView extends React.Component {

    render() {
        let {nodes, t} = this.props;
        return (
            <List>
                {nodes.map(n => {
                    return (
                        <ListItem key={n.uuid}>
                            <ListItemIcon>
                                <Folder/>
                            </ListItemIcon>
                            {/*todo: remove params={{uuid: n.uuid, name: n.name} part as it is only use for test purpose*/}
                            <ListItemText><CmLink to={n.path} params={{uuid: n.uuid, name: n.name}}>{n.name}</CmLink></ListItemText>
                        </ListItem>
                    );
                })}
            </List>
        );
    }
}

let ContentBrowserWithData = withNodesFromPath()(translate()(ContentBrowserView));

let ContentBrowser = (props) => {
    return <ContentBrowserWithData path={props.path}  search={props.search} types={['jnt:folder', 'jmix:list', 'jnt:virtualsite','jnt:virtualsitesFolder', 'jnt:page']}/>
};

export default ContentBrowser;