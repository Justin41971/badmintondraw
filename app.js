/* =========================================================
   BADMINTON DRAW PREDICTOR
   ========================================================= */

let tournament = null;

let selectedDrawSize = 64;

let currentCountrySlot = null;


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const homePage = document.getElementById("homePage");
const drawPage = document.getElementById("drawPage");

const tournamentNameInput =
    document.getElementById("tournamentName");

const createTournamentButton =
    document.getElementById("createTournamentButton");

const drawContainer =
    document.getElementById("drawContainer");

const predictorNameInput =
    document.getElementById("predictorName");

const drawTournamentName =
    document.getElementById("drawTournamentName");

const drawSizeLabel =
    document.getElementById("drawSizeLabel");

const countryModal =
    document.getElementById("countryModal");

const countrySearch =
    document.getElementById("countrySearch");

const countryList =
    document.getElementById("countryList");

const shareModal =
    document.getElementById("shareModal");

const shareLink =
    document.getElementById("shareLink");

const shareModalTitle =
    document.getElementById("shareModalTitle");

const shareModalDescription =
    document.getElementById("shareModalDescription");

const championSection =
    document.getElementById("championSection");

const championDisplay =
    document.getElementById("championDisplay");


/* =========================================================
   DRAW SIZE SELECTION
   ========================================================= */

document.querySelectorAll(".size-button").forEach(button => {

    button.addEventListener("click", () => {

        document
            .querySelectorAll(".size-button")
            .forEach(btn => btn.classList.remove("active"));

        button.classList.add("active");

        selectedDrawSize =
            Number(button.dataset.size);

    });

});


/* =========================================================
   CREATE TOURNAMENT
   ========================================================= */

createTournamentButton.addEventListener("click", () => {

    const name =
        tournamentNameInput.value.trim();

    if (!name) {

        alert("Please enter a tournament name.");

        return;
    }

    createTournament(
        name,
        selectedDrawSize
    );

});


function createTournament(name, size) {

    const players = [];

    for (let i = 0; i < size; i++) {

        players.push({
            name: "",
            country: null
        });

    }

    tournament = {

        version: 1,

        tournamentName: name,

        size: size,

        players: players,

        winners: {},

        predictorName: ""

    };

    saveTournament();

    showDrawPage();

}


/* =========================================================
   SHOW DRAW
   ========================================================= */

function showDrawPage() {

    homePage.classList.add("hidden");

    drawPage.classList.remove("hidden");

    drawTournamentName.textContent =
        tournament.tournamentName;

    drawSizeLabel.textContent =
        `Round of ${tournament.size}`;

    predictorNameInput.value =
        tournament.predictorName || "";

    renderDraw();

}


/* =========================================================
   RENDER DRAW
   ========================================================= */

function renderDraw() {

    drawContainer.innerHTML = "";

    const rounds =
        getRounds(tournament.size);

    rounds.forEach((roundSize, roundIndex) => {

        const roundColumn =
            document.createElement("div");

        roundColumn.className =
            "round-column";

        const roundTitle =
            document.createElement("div");

        roundTitle.className =
            "round-title";

        roundTitle.textContent =
            getRoundName(roundSize);

        roundColumn.appendChild(roundTitle);


        const matchCount =
            roundSize / 2;

        for (
            let matchIndex = 0;
            matchIndex < matchCount;
            matchIndex++
        ) {

            const match =
                createMatch(
                    roundIndex,
                    matchIndex,
                    roundSize
                );

            roundColumn.appendChild(match);

        }

        drawContainer.appendChild(roundColumn);

    });

    updateChampion();

}


/* =========================================================
   ROUND CALCULATIONS
   ========================================================= */

function getRounds(size) {

    const rounds = [];

    let current = size;

    while (current >= 2) {

        rounds.push(current);

        current /= 2;

    }

    return rounds;

}


function getRoundName(size) {

    if (size === 64) return "Round of 64";

    if (size === 32) return "Round of 32";

    if (size === 16) return "Round of 16";

    if (size === 8) return "Quarterfinals";

    if (size === 4) return "Semifinals";

    if (size === 2) return "Final";

    return "";

}


/* =========================================================
   CREATE MATCH
   ========================================================= */

function createMatch(
    roundIndex,
    matchIndex,
    roundSize
) {

    const match =
        document.createElement("div");

    match.className =
        "match";

    const player1 =
        getPlayerForSlot(
            roundIndex,
            matchIndex,
            0
        );

    const player2 =
        getPlayerForSlot(
            roundIndex,
            matchIndex,
            1
        );


    const playerCard1 =
        createPlayerCard(
            player1,
            roundIndex,
            matchIndex,
            0
        );

    const playerCard2 =
        createPlayerCard(
            player2,
            roundIndex,
            matchIndex,
            1
        );


    match.appendChild(playerCard1);

    match.appendChild(playerCard2);

    return match;

}


/* =========================================================
   GET PLAYER FOR A SLOT
   ========================================================= */

function getPlayerForSlot(
    roundIndex,
    matchIndex,
    position
) {

    /*
        ROUND 1

        Directly uses tournament.players
    */

    if (roundIndex === 0) {

        const index =
            matchIndex * 2 + position;

        return tournament.players[index];

    }


    /*
        LATER ROUNDS

        Winner comes from previous round.
    */

    const previousMatchIndex =
        matchIndex * 2 + position;

    const previousWinner =
        tournament.winners[
            `${roundIndex - 1}-${previousMatchIndex}`
        ];

    if (!previousWinner) {

        return null;

    }

    return previousWinner;

}


/* =========================================================
   PLAYER CARD
   ========================================================= */

function createPlayerCard(
    player,
    roundIndex,
    matchIndex,
    position
) {

    const card =
        document.createElement("div");

    card.className =
        "player-card";


    /*
        FIRST ROUND
        Allows editing player information.
    */

    if (roundIndex === 0) {

        const flagButton =
            document.createElement("button");

        flagButton.className =
            "flag-button";

        flagButton.textContent =
            player?.country?.flag || "🌐";

        flagButton.title =
            "Select country";

        flagButton.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                openCountrySelector(
                    matchIndex * 2 + position
                );

            }
        );


        const input =
            document.createElement("input");

        input.type = "text";

        input.className =
            "player-name-input";

        input.placeholder =
            `Player ${matchIndex * 2 + position + 1}`;

        input.value =
            player?.name || "";


        input.addEventListener(
            "input",
            () => {

                tournament.players[
                    matchIndex * 2 + position
                ].name = input.value;

                saveTournament();

                updateLaterRounds();

            }
        );


        card.appendChild(flagButton);

        card.appendChild(input);

    }

    else {

        /*
            LATER ROUND PLAYER
        */

        if (!player) {

            card.classList.add("empty-player");

            card.innerHTML =
                `<span>Winner of previous match</span>`;

        }

        else {

            const flag =
                document.createElement("span");

            flag.className =
                "player-flag";

            flag.textContent =
                player.country?.flag || "🌐";


            const name =
                document.createElement("span");

            name.className =
                "player-name";

            name.textContent =
                player.name || "Unnamed Player";


            card.appendChild(flag);

            card.appendChild(name);

        }

    }


    /*
        CLICK TO SELECT WINNER
    */

    if (player && player.name) {

        card.addEventListener(
            "click",
            () => {

                selectWinner(
                    roundIndex,
                    matchIndex,
                    player,
                    card
                );

            }
        );

    }


    /*
        Highlight selected winner
    */

    const winnerKey =
        `${roundIndex}-${matchIndex}`;

    const winner =
        tournament.winners[winnerKey];

    if (
        winner &&
        player &&
        winner.name === player.name
    ) {

        card.classList.add("winner");

    }


    return card;

}


/* =========================================================
   SELECT WINNER
   ========================================================= */

function selectWinner(
    roundIndex,
    matchIndex,
    player,
    card
) {

    const key =
        `${roundIndex}-${matchIndex}`;

    /*
        If clicking the same player,
        deselect them.
    */

    if (
        tournament.winners[key] &&
        tournament.winners[key].name === player.name
    ) {

        delete tournament.winners[key];

    }

    else {

        tournament.winners[key] = {
            name: player.name,
            country: player.country
                ? { ...player.country }
                : null
        };

    }


    /*
        Remove predictions from all
        later rounds because changing
        an earlier result can invalidate them.
    */

    clearLaterPredictions(roundIndex);

    saveTournament();

    renderDraw();

}


/* =========================================================
   CLEAR LATER PREDICTIONS
   ========================================================= */

function clearLaterPredictions(roundIndex) {

    Object.keys(tournament.winners)
        .forEach(key => {

            const [round] =
                key.split("-").map(Number);

            if (round > roundIndex) {

                delete tournament.winners[key];

            }

        });

}


/* =========================================================
   UPDATE LATER ROUNDS
   ========================================================= */

function updateLaterRounds() {

    renderDraw();

}


/* =========================================================
   COUNTRY SELECTOR
   ========================================================= */

function openCountrySelector(slotIndex) {

    currentCountrySlot =
        slotIndex;

    countryModal.classList.remove(
        "hidden"
    );

    countrySearch.value = "";

    renderCountries();

    setTimeout(() => {

        countrySearch.focus();

    }, 50);

}


function closeCountrySelector() {

    countryModal.classList.add(
        "hidden"
    );

    currentCountrySlot = null;

}


document
    .getElementById("closeCountryModal")
    .addEventListener(
        "click",
        closeCountrySelector
    );


countryModal
    .querySelector(".modal-background")
    .addEventListener(
        "click",
        closeCountrySelector
    );


countrySearch.addEventListener(
    "input",
    renderCountries
);


function renderCountries() {

    const search =
        countrySearch.value
            .trim()
            .toLowerCase();

    countryList.innerHTML = "";

    const filtered =
        countries.filter(country =>
            country.name
                .toLowerCase()
                .includes(search)
        );


    filtered.forEach(country => {

        const button =
            document.createElement("button");

        button.className =
            "country-option";

        button.innerHTML = `
            <span class="country-flag">
                ${country.flag}
            </span>

            <span>
                ${country.name}
            </span>
        `;


        button.addEventListener(
            "click",
            () => {

                if (
                    currentCountrySlot === null
                ) return;

                tournament.players[
                    currentCountrySlot
                ].country = {
                    code: country.code,
                    name: country.name,
                    flag: country.flag
                };


                saveTournament();

                closeCountrySelector();

                renderDraw();

            }
        );


        countryList.appendChild(button);

    });

}


/* =========================================================
   PREDICTOR NAME
   ========================================================= */

predictorNameInput.addEventListener(
    "input",
    () => {

        tournament.predictorName =
            predictorNameInput.value;

        saveTournament();

    }
);


/* =========================================================
   LOCAL STORAGE
   ========================================================= */

function saveTournament() {

    if (!tournament) return;

    localStorage.setItem(
        "badmintonTournament",
        JSON.stringify(tournament)
    );

    const saveStatus =
        document.getElementById("saveStatus");

    if (saveStatus) {

        saveStatus.textContent =
            "Saved locally";

    }

}


/* =========================================================
   LOAD LOCAL TOURNAMENT
   ========================================================= */

function loadLocalTournament() {

    const saved =
        localStorage.getItem(
            "badmintonTournament"
        );

    if (!saved) return false;

    try {

        tournament =
            JSON.parse(saved);

        return true;

    }

    catch (error) {

        console.error(
            "Could not load tournament:",
            error
        );

        return false;

    }

}


/* =========================================================
   SHARE SYSTEM
   ========================================================= */

function encodeTournament(data) {

    const json =
        JSON.stringify(data);

    const encoded =
        btoa(
            encodeURIComponent(json)
                .replace(
                    /%([0-9A-F]{2})/g,
                    (_, p1) =>
                        String.fromCharCode(
                            parseInt(p1, 16)
                        )
                )
        );

    return encoded;

}


function decodeTournament(encoded) {

    try {

        const json =
            decodeURIComponent(
                Array.prototype.map
                    .call(
                        atob(encoded),
                        char =>
                            "%" +
                            ("00" +
                                char
                                    .charCodeAt(0)
                                    .toString(16))
                                .slice(-2)
                    )
                    .join("")
            );

        return JSON.parse(json);

    }

    catch (error) {

        console.error(
            "Could not decode tournament:",
            error
        );

        return null;

    }

}


/* =========================================================
   GENERATE SHARE LINK
   ========================================================= */

function generateShareLink(
    completedPrediction
) {

    const data = {
        ...tournament
    };

    /*
        Do not share local-only data
        in a template.
    */

    if (!completedPrediction) {

        data.winners = {};

        data.predictorName = "";

    }


    const encoded =
        encodeTournament(data);

    const url =
        `${window.location.origin}${window.location.pathname}?draw=${encoded}`;

    return url;

}


/* =========================================================
   SHARE TEMPLATE
   ========================================================= */

document
    .getElementById("shareTemplateButton")
    .addEventListener(
        "click",
        () => {

            const url =
                generateShareLink(false);

            openShareModal(
                "Share Tournament Template",
                "Send this link to someone. They can enter their name and complete the draw.",
                url
            );

        }
    );


/* =========================================================
   SHARE PREDICTION
   ========================================================= */

document
    .getElementById("sharePredictionButton")
    .addEventListener(
        "click",
        () => {

            const url =
                generateShareLink(true);

            openShareModal(
                "Share Completed Prediction",
                "Send this link to share your completed tournament prediction.",
                url
            );

        }
    );


function openShareModal(
    title,
    description,
    url
) {

    shareModalTitle.textContent =
        title;

    shareModalDescription.textContent =
        description;

    shareLink.value =
        url;

    shareModal.classList.remove(
        "hidden"
    );

}


/* =========================================================
   CLOSE SHARE MODAL
   ========================================================= */

document
    .getElementById("closeShareModal")
    .addEventListener(
        "click",
        () => {

            shareModal.classList.add(
                "hidden"
            );

        }
    );


shareModal
    .querySelector(".modal-background")
    .addEventListener(
        "click",
        () => {

            shareModal.classList.add(
                "hidden"
            );

        }
    );


/* =========================================================
   COPY SHARE LINK
   ========================================================= */

document
    .getElementById("copyShareLink")
    .addEventListener(
        "click",
        async () => {

            try {

                await navigator.clipboard.writeText(
                    shareLink.value
                );

                document
                    .getElementById(
                        "copyShareLink"
                    )
                    .textContent = "Copied!";

                setTimeout(() => {

                    document
                        .getElementById(
                            "copyShareLink"
                        )
                        .textContent = "Copy";

                }, 1500);

            }

            catch {

                shareLink.select();

                document.execCommand(
                    "copy"
                );

            }

        }
    );


/* =========================================================
   IMPORT SHARED DRAW FROM URL
   ========================================================= */

function loadFromURL() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const encoded =
        params.get("draw");

    if (!encoded) return false;

    const decoded =
        decodeTournament(encoded);

    if (!decoded) {

        alert(
            "This tournament link is invalid."
        );

        return false;

    }

    tournament =
        decoded;

    saveTournament();

    showDrawPage();

    return true;

}


/* =========================================================
   BACK BUTTON
   ========================================================= */

document
    .getElementById("backButton")
    .addEventListener(
        "click",
        () => {

            drawPage.classList.add(
                "hidden"
            );

            homePage.classList.remove(
                "hidden"
            );

        }
    );


/* =========================================================
   RESET
   ========================================================= */

document
    .getElementById("resetButton")
    .addEventListener(
        "click",
        () => {

            const confirmed =
                confirm(
                    "Reset this tournament? All predictions will be deleted."
                );

            if (!confirmed) return;

            tournament.winners = {};

            tournament.predictorName = "";

            predictorNameInput.value = "";

            saveTournament();

            renderDraw();

        }
    );


/* =========================================================
   CHAMPION
   ========================================================= */

function updateChampion() {

    const finalRound =
        getRounds(tournament.size).length - 1;

    const champion =
        tournament.winners[
            `${finalRound}-0`
        ];

    if (!champion) {

        championSection.classList.add(
            "hidden"
        );

        return;

    }

    championSection.classList.remove(
        "hidden"
    );

    championDisplay.innerHTML = `
        <span class="champion-flag">
            ${champion.country?.flag || "🌐"}
        </span>

        <span>
            ${escapeHTML(champion.name)}
        </span>
    `;

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;

}


/* =========================================================
   INITIALIZE
   ========================================================= */

function initialize() {

    /*
        Priority:

        1. Shared URL
        2. Existing local tournament
        3. Home page
    */

    if (loadFromURL()) {

        return;

    }

    if (loadLocalTournament()) {

        showDrawPage();

        return;

    }

}


initialize();