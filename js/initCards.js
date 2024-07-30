import {Octokit} from "https://esm.sh/@octokit/core";
import {createCard, addFileToCard} from './cardUtils.js';

const octokit = new Octokit({
    auth: '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'
});

export async function initializeCards() {
    try {
        const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
            owner: 'wlkla',
            repo: 'lkl-s-notes',
            path: 'doc',
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });

        if (response.status === 200 && Array.isArray(response.data)) {
            const cardContainer = document.getElementById('cardContainer');
            for (const item of response.data) {
                if (item.type === 'dir') {
                    const card = createCard(item.name);
                    cardContainer.appendChild(card);
                    await populateCard(card, item.name);
                }
            }
        }
    } catch (error) {
        if (error.status === 404) {
            console.log('Doc folder not found, no cards created.');
        } else {
            console.error('Error initializing cards:', error);
        }
    }
}

async function populateCard(card, topicName) {
    try {
        const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
            owner: 'wlkla',
            repo: 'lkl-s-notes',
            path: `doc/${topicName}`,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });

        if (response.status === 200 && Array.isArray(response.data)) {
            for (const file of response.data) {
                if (file.type === 'file') {
                    addFileToCard(card, topicName, file.name);
                }
            }
        }
    } catch (error) {
        console.error(`Error populating card for ${topicName}:`, error);
    }
}