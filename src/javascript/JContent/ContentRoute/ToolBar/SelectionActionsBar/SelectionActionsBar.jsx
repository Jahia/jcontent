import React from 'react';
import {useNodeInfo} from '@jahia/data-helper';
import {useTranslation} from 'react-i18next';
import {Button, ButtonGroup, Cancel, Separator, Typography} from '@jahia/moonstone';
import styles from '~/JContent/ContentRoute/ToolBar/ToolBar.scss';
import {DisplayAction, DisplayActions} from '@jahia/ui-extender';
import PropTypes from 'prop-types';
import {ButtonRenderer, ButtonRendererNoLabel, ButtonRendererShortLabel} from '~/utils/getButtonRenderer';

export const SelectionActionsBar = ({paths, clear}) => {
    const {nodes} = useNodeInfo({paths}, {getIsNodeTypes: ['jnt:page', 'jnt:contentFolder', 'jnt:folder']});
    const {t} = useTranslation('jcontent');

    let publishAction;
    if (nodes) {
        const canPublish = nodes && nodes.map(n => n['jnt:page'] || !(n['jnt:contentFolder'] || n['jnt:folder'])).reduce((v, a) => v && a, true);
        publishAction = canPublish ? 'publish' : 'publishAll';
    }

    let context = paths.length === 1 ? {path: paths[0]} : {paths};

    return (
        <>
            <div className="flexRow">
                <Typography variant="caption"
                            data-cm-role="selection-infos"
                            data-cm-selection-size={paths.length}
                            className={`${styles.selection}`}
                >
                    {t('jcontent:label.contentManager.selection.itemsSelected', {count: paths.length})}
                </Typography>
                <div className={styles.spacer}/>
                <Button icon={<Cancel/>} variant="ghost" size="default" onClick={clear}/>
            </div>
            <div className="flexRow">
                <Separator variant="vertical" invisible="onlyChild"/>
                <DisplayActions
                    target="selectedContentActions"
                    {...context}
                    filter={action => action.key !== 'deletePermanently' && action.key.indexOf('publish') === -1}
                    buttonProps={{size: 'default', variant: 'ghost'}}
                    render={ButtonRenderer}
                />
            </div>
            <Separator variant="vertical" invisible="onlyChild"/>
            <ButtonGroup size="default" variant="outlined" color="accent">
                {publishAction &&
                    <DisplayAction actionKey={publishAction}
                                   {...context}
                                   isMediumLabel
                                   render={ButtonRendererShortLabel}/>}
                <DisplayAction menuUseElementAnchor
                               actionKey="publishMenu"
                               {...context}
                               render={ButtonRendererNoLabel}/>
            </ButtonGroup>
            <DisplayAction actionKey="publishDeletion" {...context} render={ButtonRendererShortLabel}/>
            <DisplayAction actionKey="deletePermanently" {...context} render={ButtonRendererShortLabel}/>
        </>
    );
};

SelectionActionsBar.propTypes = {
    paths: PropTypes.arrayOf(PropTypes.string),
    clear: PropTypes.func
};
