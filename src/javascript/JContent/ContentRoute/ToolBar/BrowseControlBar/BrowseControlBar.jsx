import React, {useMemo} from 'react';
import {DisplayAction, DisplayActions, registry} from '@jahia/ui-extender';
import {Separator} from '@jahia/moonstone';
import {ButtonRenderer, ButtonRendererNoLabel} from '~/utils/getButtonRenderer';
import {shallowEqual, useSelector} from 'react-redux';
import PropTypes from 'prop-types';

const excludedActions = [
    'subContents',
    'edit',
    'editPage',
    'publishMenu',
    'cut',
    'deletePermanently',
    'publishDeletion',
    'copy',
    'paste',
    'createFolder',
    'createContentFolder',
    'createContent',
    'fileUpload'
];

export const BrowseControlBar = ({isShowingActions}) => {
    const {path, siteKey, selection} = useSelector(state => ({
        path: state.jcontent.path,
        siteKey: state.site,
        selection: state.jcontent.selection
    }), shallowEqual);

    const contentActions = useMemo(() => [
        ...registry.find({type: 'action', target: 'headerPrimaryActions'}).map(action => action.key),
        ...excludedActions
    ], []);
    const isRootNode = (path === ('/sites/' + siteKey));
    const editPath = selection && selection.length === 1 ? selection[0] : path;

    return isShowingActions && !isRootNode && (
        <>
            <div className="flexRow">
                <DisplayActions target="headerPrimaryActions"
                                path={editPath}
                                render={ButtonRenderer}
                                buttonProps={{size: 'default', variant: 'ghost'}}
                                loading={() => false}/>
            </div>
            <div className="flexRow">
                <Separator variant="vertical" invisible="onlyChild"/>
                <DisplayAction isMenuPreload
                               actionKey="contentMenu"
                               path={editPath}
                               menuFilter={action => contentActions.indexOf(action.key) === -1}
                               buttonProps={{size: 'default', variant: 'ghost'}}
                               render={ButtonRendererNoLabel}
                               loading={() => false}
                />
            </div>
        </>
    );
};

BrowseControlBar.propTypes = {
    isShowingActions: PropTypes.bool.isRequired
};

export default BrowseControlBar;
