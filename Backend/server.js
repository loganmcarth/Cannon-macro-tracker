require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());

app.get("/", (req, res) => {

    res.send(
        "Cannon Macro Tracker Backend Running"
    );

});

app.get("/menu", async (req, res) => {

    try {

        const tokenResponse =
            await axios.post(
                "https://api.byu.edu/token",

                "grant_type=client_credentials" +
                `&client_id=${process.env.CLIENT_ID}` +
                `&client_secret=${process.env.CLIENT_SECRET}`,

                {
                    headers: {
                        authorization:
                            process.env.AUTHORIZATION_HEADER,

                        "content-type":
                            "application/x-www-form-urlencoded"
                    }
                }
            );

        const token =
            tokenResponse.data.access_token;

        const today =
            new Date();

        const dateString =
            `${today.getFullYear()}${String(
                today.getMonth() + 1
            ).padStart(2, "0")}${String(
                today.getDate()
            ).padStart(2, "0")}`;

        const menuResponse =
            await axios.get(
                `https://api.byu.edu/domains/mobile/dining-services/v1/CANN/${dateString}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        res.json(
            menuResponse.data
        );

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error:
                "Failed to get menu"
        });

    }

});

app.listen(
    3000,
    () => {

        console.log(
            "Server running on port 3000"
        );

    }
);