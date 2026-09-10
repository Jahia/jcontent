import {Layers, Page, Section, Tag} from '@jahia/moonstone';
import {getIcon} from '@jahia/icons';
import {getIconComponentForNodeType, getNodeTypeIcon} from './nodeTypeIcons';
import {getIconFromNode} from './getIcon';

describe('getNodeTypeIcon', () => {
    it('should draw a menu title as a section, the way the navigation does', () => {
        expect(getNodeTypeIcon('jnt:navMenuText').type).toBe(Section);
    });

    it('should not take the menu title icon from the icon registry', () => {
        // The registry answers with a Material UI SvgIcon, which sizes itself from the Material UI
        // theme and so overflows a Moonstone chip. That is the reported symptom.
        expect(getNodeTypeIcon('jnt:navMenuText').type).not.toBe(getIcon('jnt:navMenuText'));
    });

    it('should draw a category as a tag, which only jContent knew about before', () => {
        expect(getNodeTypeIcon('jnt:category').type).toBe(Tag);
    });

    it('should draw a page as a page', () => {
        expect(getNodeTypeIcon('jnt:page').type).toBe(Page);
    });

    it('should fall back to the registry for a type jContent has no opinion on', () => {
        const fromRegistry = getIcon('jnt:contentFolder');

        expect(fromRegistry).toBeDefined();
        expect(getNodeTypeIcon('jnt:contentFolder').type).toBe(fromRegistry);
    });

    it('should fall back to a neutral icon for an unknown type', () => {
        expect(getNodeTypeIcon('acme:whatever').type).toBe(Layers);
    });

    it('should have no opinion to offer for a type it does not picture itself', () => {
        expect(getIconComponentForNodeType('acme:whatever')).toBeUndefined();
    });
});

describe('the two ways of asking for an icon', () => {
    // The point of the issue: a node and its type name must not be pictured differently, which is
    // what happened when the tree resolved from the node and the chip beside it from the type name.
    const bothWays = ['jnt:navMenuText',
        'jnt:page',
        'jnt:category',
        'jnt:folder',
        'jnt:virtualsite',
        'jnt:user',
        'jnt:group',
        'jnt:externalLink',
        'jnt:nodeLink'];

    bothWays.forEach(typeName => {
        it(`should agree on ${typeName}`, () => {
            const fromNode = getIconFromNode({primaryNodeType: {name: typeName}});

            expect(fromNode.type).toBe(getNodeTypeIcon(typeName).type);
        });
    });

    it('should still draw a node of an unlisted type with the icon its definition declares', () => {
        const fromNode = getIconFromNode({primaryNodeType: {name: 'acme:whatever', icon: '/icons/acme'}});

        expect(fromNode.type).toBe('img');
        expect(fromNode.props.src).toBe('/icons/acme.png');
    });
});
