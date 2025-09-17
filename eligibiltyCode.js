// Namespace (good practice)
var CPEForm = CPEForm || {};

/**
 * OnLoad handler
 */
CPEForm.onLoad = function (executionContext) {
    var formContext = executionContext.getFormContext();

    // Run once on load
    CPEForm.handleCustomerTypeChange(formContext);
    CPEForm.handleProductTypeChange(formContext);
};

/**
 * OnChange handler for Customer Type
 */
CPEForm.handleCustomerTypeChange = function (formContext) {
    var customerType = formContext.getAttribute("aaib_customertype").getValue();
    var customerCtrl = formContext.getControl("aaib_customer");

    if (customerType === null) {
        customerCtrl.setEntityTypes(["account", "contact"]); // allow both
        return;
    }

    if (customerType === 312090000) { // Contact
        customerCtrl.setEntityTypes(["contact"]);
    } else if (customerType === 312090001) { // Account
        customerCtrl.setEntityTypes(["account"]);
    } else {
        customerCtrl.setEntityTypes(["account", "contact"]);
    }
};

/**
 * OnChange handler for Product Type
 */
CPEForm.handleProductTypeChange = function (formContext) {
    var productType = formContext.getAttribute("aaib_producttype").getValue();

    // Controls
    var loanCtrl = formContext.getControl("aaib_loan");
    var ccCtrl = formContext.getControl("aaib_creditcard");
    var baCtrl = formContext.getControl("aaib_bankaccount");

    // Reset all
    loanCtrl.setVisible(false);
    ccCtrl.setVisible(false);
    baCtrl.setVisible(false);

    formContext.getAttribute("aaib_loan").setRequiredLevel("none");
    formContext.getAttribute("aaib_creditcard").setRequiredLevel("none");
    formContext.getAttribute("aaib_bankaccount").setRequiredLevel("none");

    if (productType === null) return;

    // Show/Require based on choice
    if (productType === 312090000) { // Loan
        loanCtrl.setVisible(true);
        formContext.getAttribute("aaib_loan").setRequiredLevel("required");
    } else if (productType === 312090001) { // Credit Card
        ccCtrl.setVisible(true);
        formContext.getAttribute("aaib_creditcard").setRequiredLevel("required");
    } else if (productType === 312090002) { // Bank Account
        baCtrl.setVisible(true);
        formContext.getAttribute("aaib_bankaccount").setRequiredLevel("required");
    }
};
