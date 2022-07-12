import React from 'react';
import {mount} from '@jahia/test-framework';
import {ImageEditorDialogContainer} from './ImageEditorDialog.container';
import {MockedProvider} from '@apollo/react-testing';
import {ImageQuery} from './ImageEditorDialog.gql-queries';
import {getImageMutation} from './ImageEditorDialog.gql-mutations';
import {MuiThemeProvider} from '@material-ui/core';
import ImageEditor from './ImageEditorDialog';
import {dsGenericTheme as theme} from '@jahia/design-system-kit';

let result = {
    data: {
        jcr: {
            __typename: 'JCRQuery',
            nodeByPath: {
                width: {
                    value: 200,
                    __typename: 'JCRProperty'
                },
                height: {
                    value: 100,
                    __typename: 'JCRProperty'
                },
                nodeName: {
                    value: 'toto.jpg',
                    __typename: 'JCRProperty'
                },
                uuid: '7fca64e7-f2c4-457f-870a-fe0e6343bce2',
                path: '/toto.jpg',
                name: 'toto.jpg',
                workspace: 'edit',
                __typename: 'GenericJCRNode'
            }
        }
    }
};

let request = {
    query: ImageQuery,
    variables: {
        path: '/toto.jpg'
    }
};
const mocks = [
    {
        request: request,
        result: result
    },
    {
        request: request,
        result: result
    },
    {
        request: request,
        result: result
    },
    {
        request: {
            query: getImageMutation([]),
            variables: {
                path: '/toto.jpg'
            }
        }
    }
];

describe('Image Edition', () => {
    let props;
    let wrapper;

    beforeEach(() => {
        global.contextJsParameters = {
            config: {
            }
        };

        props = {
            path: '/toto.jpg',
            onExit: jest.fn()
        };

        wrapper = mount(
            <MuiThemeProvider theme={theme}>
                <MockedProvider mocks={mocks}>
                    <ImageEditorDialogContainer {...props}/>
                </MockedProvider>
            </MuiThemeProvider>
        );
    });

    it('render', async () => {
        expect(wrapper.find(ImageEditor).length).toBe(1);
    });
});
