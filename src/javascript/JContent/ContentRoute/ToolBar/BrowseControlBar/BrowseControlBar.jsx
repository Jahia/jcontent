import React, {useMemo} from 'react';
import {DisplayAction, DisplayActions, registry} from '@jahia/ui-extender';
import {Separator} from '@jahia/moonstone';
import {ButtonRenderer, ButtonRendererNoLabel} from '~/utils/getButtonRenderer';
import {useSelector} from 'react-redux';
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
    const {path, siteKey} = useSelector(state => ({
        path: state.jcontent.path,
        siteKey: state.site
    }));

    const contentActions = useMemo(() => [
        ...registry.find({type: 'action', target: 'headerPrimaryActions'}).map(action => action.key),
        ...excludedActions
    ], []);
    const isRootNode = (path === ('/sites/' + siteKey));

    return isShowingActions && !isRootNode && (
        <>
            <div className="flexRow">
                <DisplayActions target="headerPrimaryActions"
                                path={path}
                                render={ButtonRenderer}
                                buttonProps={{size: 'default', variant: 'ghost'}}
                                loading={() => false}/>
            </div>
            <div className="flexRow">
                <Separator variant="vertical" invisible="onlyChild"/>
                <DisplayAction isMenuPreload
                               actionKey="contentMenu"
                               path={path}
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
