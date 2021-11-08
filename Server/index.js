import express from 'express';
import axios from 'axios';

const responses = {}
const orgName = process.env.ORG_NAME || 'VBPO-spongia-hry'
const requester = axios.create({
    baseURL: 'https://api.github.com/',
    timeout: 1000,
    auth: {
        password: process.env.GITHUB_TOKEN,
        username: process.env.GITHUB_USERNAME
    }
})

const app = express();

async function cacheResponses() {
    responses['games'] = await requester.get('/orgs/${orgName}/repos')
    for (const game of responses['games']) {
        responses[game.name]
    }
}

app.get('/games', (req, res) => {
    res.send(responses['games'])
})