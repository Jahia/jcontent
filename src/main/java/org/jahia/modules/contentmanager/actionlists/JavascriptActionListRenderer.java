/**
 * ==========================================================================================
 * =                   JAHIA'S DUAL LICENSING - IMPORTANT INFORMATION                       =
 * ==========================================================================================
 *
 *                                 http://www.jahia.com
 *
 *     Copyright (C) 2002-2018 Jahia Solutions Group SA. All rights reserved.
 *
 *     THIS FILE IS AVAILABLE UNDER TWO DIFFERENT LICENSES:
 *     1/GPL OR 2/JSEL
 *
 *     1/ GPL
 *     ==================================================================================
 *
 *     IF YOU DECIDE TO CHOOSE THE GPL LICENSE, YOU MUST COMPLY WITH THE FOLLOWING TERMS:
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *     GNU General Public License for more details.
 *
 *     You should have received a copy of the GNU General Public License
 *     along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 *
 *     2/ JSEL - Commercial and Supported Versions of the program
 *     ===================================================================================
 *
 *     IF YOU DECIDE TO CHOOSE THE JSEL LICENSE, YOU MUST COMPLY WITH THE FOLLOWING TERMS:
 *
 *     Alternatively, commercial and supported versions of the program - also known as
 *     Enterprise Distributions - must be used in accordance with the terms and conditions
 *     contained in a separate written agreement between you and Jahia Solutions Group SA.
 *
 *     If you are unsure which license is appropriate for your use,
 *     please contact the sales department at sales@jahia.com.
 */
package org.jahia.modules.contentmanager.actionlists;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;
import org.jahia.data.templates.JahiaTemplatesPackage;
import org.jahia.modules.contentmanager.utils.Utils;
import org.jahia.osgi.BundleUtils;
import org.jahia.services.render.RenderContext;
import org.osgi.framework.Bundle;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.Collection;
import java.util.Set;
import java.util.TreeSet;

public class JavascriptActionListRenderer implements ActionListRenderer {

    private static final Logger logger = LoggerFactory.getLogger(JavascriptActionListRenderer.class);

    public class ActionListResource implements Comparable<ActionListResource> {

        private String url;
        private boolean embedded;
        private double priority;
        private String contents;

        public ActionListResource(String url, boolean embedded, double priority, String contents) {
            this.url = url;
            this.embedded = embedded;
            this.priority = priority;
            this.contents = contents;
        }

        public String getUrl() {
            return url;
        }

        public boolean isEmbedded() {
            return embedded;
        }

        public double getPriority() {
            return priority;
        }

        public String getContents() {
            return contents;
        }

        @Override
        public int compareTo(ActionListResource otherActionListResource) {
            if (otherActionListResource == null) {
                return 1;
            }
            if (priority == otherActionListResource.priority) {
                return url.compareTo(otherActionListResource.url);
            }
            if (priority < otherActionListResource.priority) {
                return -1;
            }
            return 1;
        }
    }

    @Override
    public String renderActionList(RenderContext renderContext) {

        // here we must scan all the bundles to find all the Javascript files to include that will
        // build the action lists.
        Collection<Bundle> bundles = Utils.getBundlesWithActionListResources();
        Set<ActionListResource> actionListResourceList = new TreeSet<>();
        for (Bundle bundle : bundles) {
            String actionListResources = bundle.getHeaders().get(Utils.HEADER_ACTION_LIST_RESOURCES);
            if (StringUtils.isNotEmpty(actionListResources)) {
                String[] actionListResourceArray = actionListResources.split(",");
                for (String actionListResourceEntry : actionListResourceArray) {
                    double priority = 0.0;
                    String url = actionListResourceEntry;
                    if (actionListResourceEntry.contains(":")) {
                        // a priority is set on the resource, we need to extract it
                        String[] priorityParts = actionListResourceEntry.split("::");
                        url = priorityParts[0];
                        priority = Double.parseDouble(priorityParts[1]);
                    }
                    JahiaTemplatesPackage module = BundleUtils.getModule(bundle);
                    Resource contentsURL = module.getResource(url);
                    try (InputStream s = contentsURL.getInputStream()){
                        String contents = "contextJsParameters['config'].actions.push(function (actionsRegistry, dxContext) {\n";
                        contents += "var moduleVersion = \"" + module.getVersion().toString() + "\";\n";
                        contents += IOUtils.toString(s);
                        contents += "\n});\n";
                        actionListResourceList.add(new ActionListResource(contentsURL.toString(), true, priority, contents));
                    } catch (IOException e) {
                        logger.error("Error reading action list resource {}", url, e);
                    }
                }
            }
        }

        StringBuilder result = new StringBuilder();

        for (ActionListResource actionListResource : actionListResourceList) {
            result.append("<script type=\"text/javascript\">\n");
            result.append(actionListResource.getContents());
            result.append("</script>");
        }

        return result.toString();
    }
}
