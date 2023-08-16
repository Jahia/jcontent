import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import {useNodeInfo} from '@jahia/data-helper';
import {Deleted} from './Deleted';
import PropTypes from 'prop-types';
import {hasMixin} from '~/JContent/JContent.utils';

export const Infos = ({currentDocument, addIntervalCallback}) => {
    const language = useSelector(state => state.language);

    const [paths, setPaths] = useState([]);

    useEffect(() => {
        const paths = [];
        paths.push(currentDocument.querySelector('[jahiatype=mainmodule]')?.getAttribute?.('path'));
        currentDocument.querySelectorAll('[jahiatype=module]').forEach(elem => {
            if (elem.getAttribute('path') !== '*') {
                paths.push(elem.getAttribute('path'));
            }
        });

        setPaths(paths);
    }, [currentDocument]);

    const {nodes} = useNodeInfo({paths, language}, {
        getDisplayName: true,
        getAggregatedPublicationInfo: true,
        getProperties: ['jcr:mixinTypes'],
        getOperationSupport: true
    });

    return Boolean(nodes) && nodes
        .filter(n => hasMixin(n, 'jmix:markedForDeletionRoot'))
        .map(n => currentDocument.querySelector(`[jahiatype][path="${n.path}"]`))
        .filter(e => e)
        .map(e => (
            <Deleted key={e.getAttribute('id')}
                     element={e}
                     addIntervalCallback={addIntervalCallback}
                     language={language}
            />
        ));
};

Infos.propTypes = {
    currentDocument: PropTypes.any,

    addIntervalCallback: PropTypes.func
};
