// new_eligibility.js

function onCustomerLoad(executionContext) {
    var formContext = executionContext.getFormContext();
    evaluateEligibility(formContext);
}

function onCustomerChange(executionContext) {
    var formContext = executionContext.getFormContext();
    evaluateEligibility(formContext);
}

function evaluateEligibility(formContext) {
    var balance = formContext.getAttribute("aaib_new_balance")?.getValue() || 0;
    var birthdate = formContext.getAttribute("birthdate")?.getValue();
    var isHighValue = formContext.getAttribute("aaib_new_highvalue")?.getValue(); // two options: true/false

    var eligibilities = [];
    var previewLabels = [];

    // Loan Eligibility
     if (balance >= 100000) {
        eligibilities.push({ productType: "Loan", productName: "Large Loan", status: "Eligible" });
        previewLabels.push("Large Loan");
    } else if (balance >= 20000) {
        eligibilities.push({ productType: "Loan", productName: "Standard Loan", status: "Eligible" });
        previewLabels.push("Standard Loan");
    }

    // Credit Card Eligibility
    if (isHighValue) {
        eligibilities.push({ productType: "Credit Card", productName: "Platinum Card", status: "Eligible" });
        previewLabels.push("Platinum Card");
    } else if (balance >= 10000) {
        eligibilities.push({ productType: "Credit Card", productName: "Gold Card", status: "Eligible" });
        previewLabels.push("Gold Card");
    } else {
        eligibilities.push({ productType: "Credit Card", productName: "Standard Card", status: "Eligible" });
        previewLabels.push("Standard Card");
    }

    // Bank Account (Youth)
    if (birthdate) {
        var today = new Date();
        var age = today.getFullYear() - birthdate.getFullYear();
        var m = today.getMonth() - birthdate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthdate.getDate())) {
            age--;
        }

        if (age <= 20) {
            eligibilities.push({ productType: "Bank Account", productName: "Youth Account", status: "Eligible" });
            previewLabels.push("Youth Account");
        }
    } 

    // Display in a form field (for quick testing)
    if (formContext.getAttribute("aaib_new_eligibilitypreview")) {
        formContext.getAttribute("aaib_new_eligibilitypreview").setValue(previewLabels.join(", "));
        formContext.getAttribute("aaib_new_eligibilitypreview").setSubmitMode("always");
    }

    return eligibilities;
}
