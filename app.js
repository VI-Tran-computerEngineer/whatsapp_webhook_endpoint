/*
 * Starter Project for WhatsApp Echo Bot Tutorial
 *
 * Remix this as the starting point for following the WhatsApp Echo Bot tutorial
 *
 */

"use strict";

// Access token for your app
// (copy token from DevX getting started page
// and save it as environment variable into the .env file)
var verify_token = "abc123123";
const curl = require("axios")
// Imports dependencies and set up http server
const request = require("request"),
    express = require("express"),
    body_parser = require("body-parser"),
    axios = require("axios").default,
    app = express().use(body_parser.json()); // creates express http server

var messages = {};
const key = "data";
messages[key] = [];

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log("webhook is listening"));

// Accepts POST requests at /webhook endpoint
app.post("/webhook", (req, res) => {
    // Parse the request body from the POST
    let body = req.body;

    // Check the Incoming webhook message
    console.log(JSON.stringify(req.body, null, 2));

    // info on WhatsApp text message payload: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples#text-messages
    if (req.body.object) {
        if (
            req.body.entry &&
            req.body.entry[0].changes &&
            req.body.entry[0].changes[0] &&
            req.body.entry[0].changes[0].value.messages &&
            req.body.entry[0].changes[0].value.messages[0]
        ) {
            let msg_phone = req.body.entry[0].changes[0].value.messages[0].from;
            let timestamp = req.body.entry[0].changes[0].value.messages[0].timestamp;
            let msg_text;
            if (req.body.entry[0].changes[0].value.messages[0].text != undefined) {
                msg_text = req.body.entry[0].changes[0].value.messages[0].text.body;
            }
            else {
                msg_text = req.body.entry[0].changes[0].value.messages[0].button.text;
            }
            if (messages[key].length > 1000) {
                messages[key] = []
            }
            let msg = {
                "from": msg_phone,
                "time": timestamp,
                "body": msg_text
            };
            let url =
                "http://api-load-balancer-1837023667.us-east-1.elb.amazonaws.com/temp/";
            url = url + msg["from"] + "/" + msg["time"] + "/" + msg["body"]
            curl.get(url).then(res => { console.log(`statusCode: ${res.status}`); console.log(res); }).catch(error => { console.error(error); });
        }
        res.sendStatus(200);
    } else {
        // Return a '404 Not Found' if event is not from a WhatsApp API
        res.sendStatus(404);
    }
});

// Accepts POST requests at /webhook endpoint
app.get("/webhook/messages", (req, res) => {
    if (messages[key].length > 0) {
        res.status(200).send(messages);
        messages[key] = [];
    }
    else {
        res.status(204);
    }
});

// Accepts GET requests at the /webhook endpoint. You need this URL to setup webhook initially.
// info on verification request payload: https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests 
app.get("/webhook", (req, res) => {
    /**
     * UPDATE YOUR VERIFY TOKEN
     *This will be the Verify Token value when you set up webhook
    **/

    // Parse params from the webhook verification request
    let mode = req.query["hub.mode"];
    let token = req.query["hub.verify_token"];
    let challenge = req.query["hub.challenge"];

    // Check if a token and mode were sent
    if (mode && token) {
        // Check the mode and token sent are correct
        if (mode === "subscribe" && token === verify_token) {
            // Respond with 200 OK and challenge token from the request
            console.log("WEBHOOK_VERIFIED");
            res.status(200).send(challenge);
        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
});
