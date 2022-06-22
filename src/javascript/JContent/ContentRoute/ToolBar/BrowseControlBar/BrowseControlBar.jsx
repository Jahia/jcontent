import React, {useMemo} from 'react';
import {DisplayAction, DisplayActions, registry} from '@jahia/ui-extender';
import {Separator} from '@jahia/moonstone';
import FileModeSelector from '../FileModeSelector';
import JContentConstants from '~/JContent/JContent.constants';
import {ButtonRenderer, ButtonRendererNoLabel} from '~/utils/getButtonRenderer';
import {useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import ViewModeSelector from '../ViewModeSelector';

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
    const {path, mode, siteKey} = useSelector(state => ({
        path: state.jcontent.path,
        mode: state.jcontent.mode,
        siteKey: state.site
    }));

    const contentActions = useMemo(() => [
        ...registry.find({type: 'action', target: 'headerPrimaryActions'}).map(action => action.key),
        ...excludedActions
    ], []);
    const isRootNode = (path === ('/sites/' + siteKey));

    return (
        <React.Fragment>
            {isShowingActions && !isRootNode && (
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
            )}
            <div className="flexFluid"/>
            {isShowingActions && mode === JContentConstants.mode.MEDIA &&
            <FileModeSelector/>}
            {isShowingActions && mode !== JContentConstants.mode.MEDIA &&
            <ViewModeSelector/>}
        </React.Fragment>
    );
};

BrowseControlBar.propTypes = {
    isShowingActions: PropTypes.bool.isRequired
};

export default BrowseControlBar;
