package org.jahia.modules.contenteditor.api.forms.model;

public class Condition {
    private String nodeType;
    private Boolean orderable;
    private String withPermission;
    private String withoutPermission;

    public String getNodeType() {
        return nodeType;
    }

    public void setNodeType(String nodeType) {
        this.nodeType = nodeType;
    }

    public Boolean getOrderable() {
        return orderable;
    }

    public void setOrderable(Boolean orderable) {
        this.orderable = orderable;
    }

    public String getWithPermission() {
        return withPermission;
    }

    public void setWithPermission(String withPermission) {
        this.withPermission = withPermission;
    }

    public String getWithoutPermission() {
        return withoutPermission;
    }

    public void setWithoutPermission(String withoutPermission) {
        this.withoutPermission = withoutPermission;
    }
}
