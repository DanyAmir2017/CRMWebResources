// Namespace
window.EligibilityPersistence = window.EligibilityPersistence || {};
/**
 * OnSave handler - entry point
 */
EligibilityPersistence.onSave = async function (executionContext) {
    var formContext = executionContext.getFormContext();

    // Get eligibility preview values
    var preview = formContext.getAttribute("aaib_new_eligibilitypreview")?.getValue();
    if (!preview) return;

    var eligibilities = preview.split(",").map(e => e.trim());

    // Convert to structured objects for CPE
    var records = EligibilityPersistence.mapEligibilitiesToRecords(formContext, eligibilities);

    console.log("Mapped Records:", records);

    // Persist to Dataverse
    // Persist each record
    for (const record of records) {
        await EligibilityPersistence.upsertCPE(record, formContext);
    }
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

/**
 * Upsert logic: Updates if record exists for same contact + product type, else creates new
 */
EligibilityPersistence.upsertCPE = async function (record, formContext) {
    try {
        // Check if CPE already exists for this contact & product type
        var query = `?$select=aaib_customerproducteligibilityid
                     &$filter=_aaib_contact_value eq ${formContext.data.entity.getId().replace(/[{}]/g, "")}
                     and aaib_producttype eq ${record.aaib_producttype}`;

        const existing = await Xrm.WebApi.retrieveMultipleRecords("aaib_customerproducteligibility", query);

        if (existing.entities.length > 0) {
            // Update existing record
            const id = existing.entities[0].aaib_customerproducteligibilityid;
            await Xrm.WebApi.updateRecord("aaib_customerproducteligibility", id, record);
            console.log(`CPE updated for product type ${record.aaib_producttype}, ID: ${id}`);
        } else {
            // Create new record
            const result = await Xrm.WebApi.createRecord("aaib_customerproducteligibility", record);
            console.log("CPE created with ID:", result.id);
        }
    } catch (error) {
        console.error("Error upserting CPE:", error.message);
    }
};
