package org.jahia.modules.contenteditor.graphql.api.types;

import org.jahia.services.content.JCRNodeWrapper;
import org.junit.Test;

import java.lang.reflect.Proxy;

import static org.junit.Assert.assertEquals;

public class GqlPrincipalTest {

    @Test
    public void readsTheProviderOfAGlobalUserFromItsMountFolder() {
        assertEquals("ldap", providerOf("/users/providers/ldap/jsmith"));
    }

    @Test
    public void readsTheProviderOfASiteGroupFromItsMountFolder() {
        assertEquals("ldap", providerOf("/sites/digitall/groups/providers/ldap/editors"));
    }

    @Test
    public void readsTheDefaultProviderForAPrincipalStoredInTheRepository() {
        assertEquals("default", providerOf("/users/ab/cd/ef/jsmith"));
        assertEquals("default", providerOf("/sites/digitall/groups/site-users"));
    }

    @Test
    public void readsTheDefaultProviderForAPrincipalNamedLikeTheProvidersFolder() {
        assertEquals("default", providerOf("/users/providers"));
        assertEquals("default", providerOf("/groups/providers"));
    }

    @Test
    public void readsTheProviderOnlyFromAUsersOrGroupsFolder() {
        assertEquals("default", providerOf("/sites/providers/users/ab/cd/ef/jsmith"));
    }

    private static String providerOf(String path) {
        JCRNodeWrapper node = (JCRNodeWrapper) Proxy.newProxyInstance(GqlPrincipalTest.class.getClassLoader(),
            new Class<?>[]{JCRNodeWrapper.class}, (proxy, method, args) -> {
                if ("getPath".equals(method.getName())) {
                    return path;
                }
                throw new UnsupportedOperationException(method.getName());
            });
        return new GqlPrincipal(node).getProvider();
    }
}
