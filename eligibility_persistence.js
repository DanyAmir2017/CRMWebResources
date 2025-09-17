// Namespace
var EligibilityPersistence = EligibilityPersistence || {};

/**
 * OnSave handler - entry point
 */
EligibilityPersistence.onSave = function (executionContext) {
    var formContext = executionContext.getFormContext();

    // Get eligibility preview values
    var preview = formContext.getAttribute("aaib_new_eligibilitypreview")?.getValue();
    if (!preview) return;

    var eligibilities = preview.split(",").map(e => e.trim());

    // Convert to structured objects for CPE
    var records = EligibilityPersistence.mapEligibilitiesToRecords(formContext, eligibilities);

    console.log("Mapped Records:", records);

    // Persist with upsert logic
    eligibilities.forEach(function (elig) {
        EligibilityPersistence.upsertEligibility(formContext, elig);
    });
};

/**
 * Mapper: Converts text-based eligibility into structured CPE records
 */
EligibilityPersistence.mapEligibilitiesToRecords = function (formContext, eligibilities) {
    var customerId = formContext.data.entity.getId(); // current contact GUID
    if (!customerId) return [];

    customerId = customerId.replace(/[{}]/g, ""); // clean GUID

    var firstName = formContext.getAttribute("firstname")?.getValue() || "";
    var lastName = formContext.getAttribute("lastname")?.getValue() || "";
    var customerName = (firstName + " " + lastName).trim();
    if (!customerName) customerName = "Unknown Customer";

    var records = [];

    eligibilities.forEach(function (elig) {
        var record = {
            "aaib_Contact@odata.bind": "/contacts(" + customerId + ")",
            aaib_eligibilitystatus: 312090000, // E
            // ligible (default choice value)
            aaib_name: customerName + " - " + elig  // ✅ include customer name
        };

        // Map product type      
        if (elig === "Large Loan" || elig === "Standard Loan") {
            record.aaib_producttype = 312090000; // Loan
        }
        else if (elig === "Platinum Card" || elig === "Gold Card" || elig === "Standard Card") {
            record.aaib_producttype = 312090001; // Credit Card
        }
        else if (elig === "Youth Account") {
            record.aaib_producttype = 312090002; // Bank Account
        }

        records.push(record);
    });

    return records;
};
