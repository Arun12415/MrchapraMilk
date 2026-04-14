const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {

    // CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            body: ''
        };
    }

    try {
        // ✅ FIX 1: Body parse karo safely
        const body = event.body ? JSON.parse(event.body) : {};

        // ✅ FIX 2: Debug log (CloudWatch me dikhega)
        console.log("Incoming body:", JSON.stringify(body));

        const { name, phone, milkType, address } = body;

        // ✅ FIX 3: Validation - required fields check
        if (!phone || !name) {
            console.log("Validation failed - missing phone or name");
            return {
                statusCode: 400,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ error: "Name and Phone are required" })
            };
        }

        const params = {
            TableName: "MrChapraSubscriptions",
            Item: {
                PhoneNumber: phone,           // Primary Key
                CustomerName: name,
                Product: milkType || "Not specified",
                DeliveryAddress: address || "Not provided",
                SubscriptionDate: new Date().toISOString(),
                Status: "PENDING_CONFIRMATION"
            }
        };

        // ✅ FIX 4: Log before insert
        console.log("Inserting into DynamoDB:", JSON.stringify(params.Item));

        await dynamo.put(params).promise();

        // ✅ FIX 5: Log after success
        console.log("Successfully inserted into DynamoDB");

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message: "Subscription Saved Successfully and Thank You" })
        };

    } catch (error) {
        // ✅ FIX 6: Full error log
        console.error("DynamoDB Error:", error.message, error.stack);

        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: error.message })
        };
    }
};
