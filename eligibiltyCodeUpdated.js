// CPEForm library - resilient version
var CPEForm = CPEForm || {};

/**
 * Helper: normalize parameter to a formContext.
 * Accepts either executionContext (preferred) or a formContext object.
 */
CPEForm._getFormContext = function (executionContextOrFormContext) {
    if (!executionContextOrFormContext) return null;

    // If executionContext (has getFormContext)
    if (typeof executionContextOrFormContext.getFormContext === "function") {
        try { return executionContextOrFormContext.getFormContext(); } catch (e) { return null; }
    }

    // If a formContext was passed directly (rare) - it must have getAttribute
    if (typeof executionContextOrFormContext.getAttribute === "function") {
        return executionContextOrFormContext;
    }

    return null;
};

/**
 * OnLoad handler
 */
CPEForm.onLoad = function (executionContext) {
    var formContext = CPEForm._getFormContext(executionContext);
    if (!formContext) {
        console.error("CPEForm.onLoad: formContext not available");
        return;
    }

    // Initialize UI state
    CPEForm.handleCustomerTypeChange(executionContext);
    CPEForm.handleProductTypeChange(executionContext);
};

/**
 * OnChange handler for Customer Type
 * Accepts executionContext or formContext
 */
CPEForm.handleCustomerTypeChange = function (executionContextOrFormContext) {
    var formContext = CPEForm._getFormContext(executionContextOrFormContext);
    if (!formContext) {
        console.error("CPEForm.handleCustomerTypeChange: formContext not available");
        return;
    }

    var customerAttr = formContext.getAttribute("aaib_customertype");
    if (!customerAttr) {
        console.warn("CPEForm.handleCustomerTypeChange: attribute 'aaib_customertype' not found on this form.");
        return;
    }

    var customerType = customerAttr.getValue(); // may be null or a number
    var customerCtrl = formContext.getControl("aaib_customer");

    // If control not present, just return (form layout may differ)
    if (!customerCtrl || typeof customerCtrl.setEntityTypes !== "function") {
        console.warn("CPEForm.handleCustomerTypeChange: control 'aaib_customer' not available or doesn't support setEntityTypes.");
        return;
    }

    // Option values: adjust if your option set uses different numbers
    // 312090000 = Contact, 312090001 = Account (as you provided)
    if (customerType === 312090000) { // Contact
        customerCtrl.setEntityTypes(["contact"]);
    } else if (customerType === 312090001) { // Account
        customerCtrl.setEntityTypes(["account"]);
    } else {
        // If null or other, allow both
        customerCtrl.setEntityTypes(["account", "contact"]);
    }
};

/**
 * OnChange handler for Product Type
 * Accepts executionContext or formContext
 */
CPEForm.handleProductTypeChange = function (executionContextOrFormContext) {
    var formContext = CPEForm._getFormContext(executionContextOrFormContext);
    if (!formContext) {
        console.error("CPEForm.handleProductTypeChange: formContext not available");
        return;
    }

    var productAttr = formContext.getAttribute("aaib_producttype");
    if (!productAttr) {
        console.warn("CPEForm.handleProductTypeChange: attribute 'aaib_producttype' not found on this form.");
        return;
    }
    var productType = productAttr.getValue(); // may be null

    // Controls (may be null if control not on this form)
    var loanCtrl = formContext.getControl("aaib_loan");
    var ccCtrl   = formContext.getControl("aaib_creditcard");
    var baCtrl   = formContext.getControl("aaib_bankaccount");

    // Ensure attributes exist
    var loanAttr = formContext.getAttribute("aaib_loan");
    var ccAttr   = formContext.getAttribute("aaib_creditcard");
    var baAttr   = formContext.getAttribute("aaib_bankaccount");

    // Hide all and clear required flags
    if (loanCtrl) loanCtrl.setVisible(false);
    if (ccCtrl)   ccCtrl.setVisible(false);
    if (baCtrl)   baCtrl.setVisible(false);

    if (loanAttr) loanAttr.setRequiredLevel("none");
    if (ccAttr)   ccAttr.setRequiredLevel("none");
    if (baAttr)   baAttr.setRequiredLevel("none");

    // Clear values for non-relevant lookups to avoid stale data blocking save
    if (loanAttr) loanAttr.setValue(null);
    if (ccAttr)   ccAttr.setValue(null);
    if (baAttr)   baAttr.setValue(null);

    // If no selection, we're done
    if (productType === null || typeof productType === "undefined") {
        return;
    }

    // Map your product type option values accordingly:
    // 312090000 = Loan, 312090001 = Credit Card, 312090002 = Bank Account
    if (productType === 312090000) { // Loan
        if (loanCtrl) loanCtrl.setVisible(true);
        if (loanAttr) loanAttr.setRequiredLevel("required");
    } else if (productType === 312090001) { // Credit Card
        if (ccCtrl) ccCtrl.setVisible(true);
        if (ccAttr) ccAttr.setRequiredLevel("required");
    } else if (productType === 312090002) { // Bank Account
        if (baCtrl) baCtrl.setVisible(true);
        if (baAttr) baAttr.setRequiredLevel("required");
    } else {
        // Unknown product type — just log
        console.warn("CPEForm.handleProductTypeChange: unknown product type value:", productType);
    }
};
