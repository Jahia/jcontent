import React from 'react';
import {Trans} from 'react-i18next';
import {getName} from '~/JContent';

export const renderLabel = ({dialogType, locked, count, data, firstNode, pages, folders, t}) => {
    if (locked) {
        return (
            <Trans i18nKey={`jcontent:label.contentManager.deleteAction.locked.${dialogType}.content`}
                   count={count}
            >
                <strong>{{name: data.jcr.nodesByPath.map(n => getName(n)).join(', ')}}</strong>
                <strong>{{parentName: firstNode && getName(firstNode?.rootDeletionInfo[0])}}</strong>
            </Trans>
        );
    }

    if (!count) {
        return t('jcontent:label.contentManager.deleteAction.loading');
    }

    if (count === 1) {
        return (
            <Trans i18nKey={`jcontent:label.contentManager.deleteAction.${dialogType}.item`}>
                <span>{{name: firstNode && getName(firstNode)}}</span>
                <strong/>
            </Trans>
        );
    }

    if (pages === 0 && folders === 0) {
        return (
            <Trans i18nKey={`jcontent:label.contentManager.deleteAction.${dialogType}.itemsOnly`}
                   values={{count}}
                   components={{span: <span/>}}/>
        );
    }

    if (pages === 0) {
        return (
            <Trans i18nKey={`jcontent:label.contentManager.deleteAction.${dialogType}.filesAndFolders`}
                   values={{count, folders}}
                   components={{span: <span/>}}/>
        );
    }

    return (
        <Trans i18nKey={`jcontent:label.contentManager.deleteAction.${dialogType}.items`}
               values={{count, pages}}
               components={{span: <span/>}}/>
    );
};
