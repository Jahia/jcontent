import {registry} from '@jahia/ui-extender';
import {registerSidePanelTabs} from '~/JContent/SidePanel/registerSidePanelTabs';
import {ensureSidePanelTabsRegistered, getJContentMode, resolveInitialTab} from './ContentSidePanel.utils';

jest.mock('@jahia/ui-extender', () => ({
    registry: {
        find: jest.fn(() => [])
    }
}));

jest.mock('~/JContent/SidePanel/registerSidePanelTabs', () => ({
    registerSidePanelTabs: jest.fn()
}));

describe('ContentSidePanel utils', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('resolveInitialTab', () => {
        it('should map the friendly aliases to their registry keys', () => {
            expect(resolveInitialTab('preview')).toBe('jcontentSidePanelPreviewTab');
            expect(resolveInitialTab('details')).toBe('ceSidePanelDetailsTab');
            expect(resolveInitialTab('history')).toBe('ceSidePanelHistoryTab');
            expect(resolveInitialTab('usages')).toBe('ceSidePanelUsagesTab');
        });

        it('should pass unknown keys through, so tabs added by other modules can be targeted', () => {
            expect(resolveInitialTab('myModuleSidePanelTab')).toBe('myModuleSidePanelTab');
        });

        it('should return null when nothing is requested', () => {
            expect(resolveInitialTab()).toBeNull();
            expect(resolveInitialTab('')).toBeNull();
        });
    });

    describe('getJContentMode', () => {
        it('should use the pages mode for a page', () => {
            expect(getJContentMode({isPage: true})).toBe('pages');
        });

        it('should use the pages mode for content living inside a page', () => {
            expect(getJContentMode({pageAncestors: [{path: '/sites/x/home'}]})).toBe('pages');
        });

        it('should use the media mode for a file', () => {
            expect(getJContentMode({isFile: true})).toBe('media');
        });

        it('should fall back to content folders', () => {
            expect(getJContentMode({pageAncestors: []})).toBe('content-folders');
            expect(getJContentMode(null)).toBe('content-folders');
        });
    });

    describe('ensureSidePanelTabsRegistered', () => {
        it('should register the tabs when the target is empty', () => {
            registry.find.mockReturnValue([]);
            ensureSidePanelTabsRegistered();
            expect(registerSidePanelTabs).toHaveBeenCalledWith(registry);
        });

        it('should not register the tabs again when they are already there', () => {
            registry.find.mockReturnValue([{key: 'ceSidePanelDetailsTab'}]);
            ensureSidePanelTabsRegistered();
            expect(registerSidePanelTabs).not.toHaveBeenCalled();
        });
    });
});
