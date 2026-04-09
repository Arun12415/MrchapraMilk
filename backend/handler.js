const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    // Handling CORS for preflight requests
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
        const body = JSON.parse(event.body);
        const { name, phone, milkType, address } = body;

        const params = {
            TableName: "MrChapraSubscriptions",
            Item: {
                PhoneNumber: phone, // Primary Key
                CustomerName: name,
                Product: milkType,
                DeliveryAddress: address,
                SubscriptionDate: new Date().toISOString(),
                Status: "PENDING_CONFIRMATION"
            }
        };

        await dynamo.put(params).promise();

        return {
            statusCode: 200,
            headers: { 
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({ message: "Subscription Saved" })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: error.message })
        };
    }
};