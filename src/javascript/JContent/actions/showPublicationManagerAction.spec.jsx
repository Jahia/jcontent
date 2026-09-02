import React from 'react';
import {useSelector} from 'react-redux';
import {useNodeChecks} from '@jahia/data-helper';
import {shallow} from '@jahia/test-framework';
import {Typography} from '@jahia/moonstone';

import {PublishManagerActionComponent} from './showPublicationManagerAction';

jest.mock('react-redux', () => {
    return {useSelector: jest.fn()};
});
jest.mock('@jahia/data-helper', () => {
    // Keep PredefinedFragments: JContent.utils pulls it in through nodeVisibilityUtils.
    return {...jest.requireActual('@jahia/data-helper'), useNodeChecks: jest.fn()};
});

describe('PublishManagerActionComponent', () => {
    let defaultProps;

    beforeEach(() => {
        window.authoringApi = {showPublicationManager: jest.fn()};
        useSelector.mockImplementation(() => {
            return {language: 'en', siteKey: 'digitall'};
        });
        useNodeChecks.mockImplementation(() => {
            return {
                loading: false,
                checksResult: true,
                node: {
                    displayName: 'Taber',
                    primaryNodeType: {name: 'jnt:person'},
                    mixinTypes: [{name: 'jmix:renderable'}],
                    site: {
                        languages: [
                            {language: 'en', activeInEdit: true},
                            {language: 'de', activeInEdit: false}
                        ]
                    }
                }
            };
        });
        defaultProps = {
            id: 'publicationManager',
            path: '/sites/digitall/contents/person-portrait-1',
            buttonLabel: 'jcontent:label.contentManager.publicationDashboard.label',
            publicationNodeTypes: ['jmix:publication'],
            render: jest.fn(() => {
                return <Typography>render</Typography>;
            })
        };
    });

    it('should ask the node checks for the primary node type', () => {
        shallow(<PublishManagerActionComponent {...defaultProps}/>);

        // The click below reads res.node.primaryNodeType.name, and useNodeInfo only adds that
        // field to the generated query when this option is set - without it the click throws.
        expect(useNodeChecks.mock.calls[0][1].getPrimaryNodeType).toBe(true);
    });

    it('should hand the primary node type to the authoring API on click', () => {
        const cmp = shallow(<PublishManagerActionComponent {...defaultProps}/>);

        cmp.props().onClick();

        expect(window.authoringApi.showPublicationManager).toHaveBeenCalledWith(
            'publicationManager',
            '/sites/digitall/contents/person-portrait-1',
            'Taber',
            ['jnt:person'],
            ['jmix:renderable'],
            'digitall',
            ['jmix:publication'],
            [{language: 'en', activeInEdit: true}]
        );
    });

    it('should not render when several paths are selected', () => {
        defaultProps.paths = ['/one', '/two'];

        const cmp = shallow(<PublishManagerActionComponent {...defaultProps}/>);

        expect(cmp.isEmptyRender()).toBe(true);
    });
});
