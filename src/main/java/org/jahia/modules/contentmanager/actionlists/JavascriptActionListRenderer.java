package org.jahia.modules.contentmanager.actionlists;

import org.apache.commons.io.IOUtils;
import org.jahia.data.templates.JahiaTemplatesPackage;
import org.jahia.services.render.RenderContext;
import org.jahia.services.templates.JahiaTemplateManagerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.net.URL;
import java.util.Set;
import java.util.TreeSet;

public class JavascriptActionListRenderer implements ActionListRenderer {

    private static final Logger logger = LoggerFactory.getLogger(JavascriptActionListRenderer.class);

    private JahiaTemplateManagerService templateManagerService = null;

    public void setTemplateManagerService(JahiaTemplateManagerService templateManagerService) {
        this.templateManagerService = templateManagerService;
    }

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

        // here we must scan all the modules installed on this site to find all the Javascript files to include that will
        // build the action lists.
        Set<String> installedModules = renderContext.getSite().getInstalledModulesWithAllDependencies();
        Set<ActionListResource> actionListResourceList = new TreeSet<>();
        for (String siteInstalledModule : installedModules) {
            JahiaTemplatesPackage templatesPackage = templateManagerService.getTemplatePackageById(siteInstalledModule);
            String actionListResources = templatesPackage.getBundle().getHeaders().get("Jahia-ActionList-Resources");
            if (actionListResources != null) {
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
                    URL contentsURL = templatesPackage.getBundle().getResource(url);
                    String contents = null;
                    try {
                        contents = IOUtils.toString(contentsURL.openStream());
                    } catch (IOException e) {
                        logger.error("Error reading action list resource {}", url, e);
                    }
                    actionListResourceList.add(new ActionListResource(url, true, priority, contents));
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
