import {Octokit} from "https://esm.sh/@octokit/core";
import {createCard, addFileToCard} from './cardUtils.js';
import {getGitHubInfo} from './github.js';

let existingTopics = [];

export async function initializeCards() {
    try {
        const cardContainer = document.getElementById('cardContainer');
        cardContainer.innerHTML = '';
        const githubInfo = getGitHubInfo();
        const octokit = new Octokit({
            auth: githubInfo.userToken
        });
        const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
            owner: githubInfo.username,
            repo: githubInfo.repoName,
            path: githubInfo.filePath,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });

        if (response.status === 200 && Array.isArray(response.data)) {
            for (const item of response.data) {
                if (item.type === 'dir') {
                    existingTopics.push(item.name);
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
        const githubInfo = getGitHubInfo();
        const octokit = new Octokit({
            auth: githubInfo.userToken
        });
        const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
            owner: githubInfo.username,
            repo: githubInfo.repoName,
            path: `${githubInfo.filePath}/${topicName}`,
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

export function getTopics(){
    return existingTopics;
}