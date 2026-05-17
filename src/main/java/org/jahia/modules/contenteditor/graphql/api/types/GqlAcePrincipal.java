/*
 * MIT License
 *
 * Copyright (c) 2002 - 2022 Jahia Solutions Group. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
package org.jahia.modules.contenteditor.graphql.api.types;

import graphql.annotations.annotationTypes.GraphQLDescription;
import graphql.annotations.annotationTypes.GraphQLField;
import org.jahia.modules.graphql.provider.dxm.user.GqlUser;

/**
 * GraphQL representation of the principal (user or group) referenced by an ACE node.
 * <p>
 * ACE node names in Jahia follow the pattern {@code {GRANT|DENY}_u_{username}} for users
 * and {@code {GRANT|DENY}_g_{groupname}} for groups (colons and slashes in the original
 * principal key are replaced with underscores).
 */
@GraphQLDescription("The principal (user or group) referenced by an ACE history entry")
public class GqlAcePrincipal {

    private final String verb;
    private final String principalType;
    private final String principalName;
    private final GqlUser user;

    public GqlAcePrincipal(String verb, String principalType, String principalName, GqlUser user) {
        this.verb = verb;
        this.principalType = principalType;
        this.principalName = principalName;
        this.user = user;
    }

    @GraphQLField
    @GraphQLDescription("The ACE verb: GRANT or DENY")
    public String getVerb() {
        return verb;
    }

    @GraphQLField
    @GraphQLDescription("The principal type: USER or GROUP")
    public String getPrincipalType() {
        return principalType;
    }

    @GraphQLField
    @GraphQLDescription("The raw principal name as encoded in the ACE node name")
    public String getPrincipalName() {
        return principalName;
    }

    @GraphQLField
    @GraphQLDescription("The resolved Jahia user. Null when the principal is a group or when the user cannot be found.")
    public GqlUser getUser() {
        return user;
    }
}
