import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import {useNodeInfo} from '@jahia/data-helper';
import {Deleted} from './Deleted';
import PropTypes from 'prop-types';

export const Infos = ({currentDocument}) => {
    const {language} = useSelector(state => ({
        language: state.language
    }));

    const [paths, setPaths] = useState([]);

    useEffect(() => {
        console.log('get stuff');
        const paths = [];
        currentDocument.querySelectorAll('[jahiatype=module]').forEach(elem => {
            if (elem.getAttribute('path') !== '*') {
                paths.push(elem.getAttribute('path'));
            }
        });

        setPaths(paths);
    }, [currentDocument]);

    const {nodes} = useNodeInfo({paths, language}, {getDisplayName: true, getAggregatedPublicationInfo: true});

    return Boolean(nodes) && nodes
        .filter(n => n.aggregatedPublicationInfo.publicationStatus === 'MARKED_FOR_DELETION')
        .map(n => currentDocument.querySelector(`[jahiatype][path="${n.path}"]`))
        .filter(e => e)
        .map(e => (
            <Deleted key={e.getAttribute('id')}
                     element={e}
                     language={language}
            />
        ));
};

Infos.propTypes = {
    currentDocument: PropTypes.any
};
