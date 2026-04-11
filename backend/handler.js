const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    // 1. Sabse pehle Headers define karein (Ye CORS issue fix karega)
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token"
    };

    // 2. Preflight request check (Browser pehle ye bhejta hai)
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        // 3. Frontend se aaya data parse karein
        const body = JSON.parse(event.body);
        
        // Dhyan dein: Frontend mein hum fullName, phoneNumber use kar rahe hain
        const { fullName, phoneNumber, milkType, address } = body;

        // 4. DynamoDB mein save karne ka saaman
        const params = {
            TableName: "MrChapraSubscriptions",
            Item: {
                PhoneNumber: phoneNumber || "No-Phone", 
                CustomerName: fullName || "Anonymous",
                Product: milkType || "Not-Selected",
                DeliveryAddress: address || "No-Address",
                SubscriptionDate: new Date().toISOString(),
                Status: "ACTIVE"
            }
        };

        await dynamo.put(params).promise();

        // 5. Success Response
        return {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify({ 
                message: "Mubarak ho! Mr Chapra Milk ki subscription confirm ho gayi.",
                id: phoneNumber 
            })
        };

    } catch (error) {
        console.error("Database Error:", error);
        return {
            statusCode: 500,
            headers: headers,
            body: JSON.stringify({ 
                message: "Backend Error", 
                details: error.message 
            })
        };
    }
};
