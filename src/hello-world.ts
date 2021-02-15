const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
const GREETING = process.env.GREETING || 'Hello,World!';

export const handler = async () : Promise <any> => {

    const responseObject =  { greeting: GREETING }

    return { statusCode: 200, body: JSON.stringify(responseObject) };

};
