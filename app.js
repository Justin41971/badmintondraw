
/* =========================================================
   BADMINTON DRAW BUILDER
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
   FLAG URLS
   ========================================================= */

/*
    Normal countries:

    Example:
    CA -> https://flagcdn.io/flags/4x3/ca.svg
    CN -> https://flagcdn.io/flags/4x3/cn.svg
    JP -> https://flagcdn.io/flags/4x3/jp.svg

    Chinese Taipei is special because we want the
    Olympic Chinese Taipei flag rather than the
    standard Taiwan flag.
*/

const CHINESE_TAIPEI_OLYMPIC_FLAG =
    "https://commons.wikimedia.org/wiki/Special:Redirect/file/Flag_of_Chinese_Taipei_for_Olympic_Games.svg";


function getFlagURL(countryCode) {

    if (!countryCode) {
        return null;
    }

    const code =
        countryCode.toUpperCase().trim();


    /*
        Chinese Taipei / Olympic flag
    */

    if (code === "TW") {
        return CHINESE_TAIPEI_OLYMPIC_FLAG;
    }


    /*
        All normal countries
    */

    return `https://flagcdn.io/flags/4x3/${code.toLowerCase()}.svg`;

}


/* =========================================================
   CREATE FLAG IMAGE
   ========================================================= */

function createFlagImage(
    country,
    className
) {

    const img =
        document.createElement("img");

    img.className =
        className;


    if (!country || !country.code) {

        /*
            Generic globe if no country
            has been selected.
        */

        img.src =
            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ctext x='12' y='18' text-anchor='middle' font-size='18'%3E%F0%9F%8C%90%3C/text%3E%3C/svg%3E";

        img.alt =
            "No country selected";

        return img;

    }


    img.src =
        getFlagURL(
            country.code
        );

    img.alt =
        country.name || country.code;

    img.loading =
        "lazy";


    /*
        If an image fails to load,
        show a neutral fallback.
    */

    img.onerror = () => {

        img.removeAttribute("src");

        img.textContent =
            "🌐";

    };


    return img;

}


/* =========================================================
   DRAW SIZE SELECTION
   ========================================================= */

document
    .querySelectorAll(".size-button")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(".size-button")
                    .forEach(btn =>
                        btn.classList.remove("active")
                    );

                button.classList.add("active");

                selectedDrawSize =
                    Number(button.dataset.size);

            }
        );

    });


/* =========================================================
   CREATE TOURNAMENT
   ========================================================= */

createTournamentButton.addEventListener(
    "click",
    () => {

        const name =
            tournamentNameInput.value.trim();

        if (!name) {

            alert(
                "Please enter a tournament name."
            );

            return;
        }

        createTournament(
            name,
            selectedDrawSize
        );

    }
);


function createTournament(
    name,
    size
) {

    const players = [];

    for (
        let i = 0;
        i < size;
        i++
    ) {

        players.push({

            name: "",

            country: null

        });

    }


    tournament = {

        version: 3,

        tournamentName:
            name,

        size:
            size,

        players:
            players,

        winners:
            {},

        predictorName:
            ""

    };


    saveTournament();

    showDrawPage();

}


/* =========================================================
   SHOW DRAW
   ========================================================= */

function showDrawPage() {

    homePage.classList.add(
        "hidden"
    );

    drawPage.classList.remove(
        "hidden"
    );


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

    drawContainer.innerHTML =
        "";


    const rounds =
        getRounds(
            tournament.size
        );


    rounds.forEach(
        (roundSize, roundIndex) => {

            const roundColumn =
                document.createElement(
                    "div"
                );

            roundColumn.className =
                "round-column";


            const roundTitle =
                document.createElement(
                    "div"
                );

            roundTitle.className =
                "round-title";

            roundTitle.textContent =
                getRoundName(
                    roundSize
                );


            roundColumn.appendChild(
                roundTitle
            );


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


                roundColumn.appendChild(
                    match
                );

            }


            drawContainer.appendChild(
                roundColumn
            );

        }
    );


    updateChampion();

}


/* =========================================================
   ROUND CALCULATIONS
   ========================================================= */

function getRounds(size) {

    const rounds = [];

    let current = size;


    while (
        current >= 2
    ) {

        rounds.push(
            current
        );

        current /= 2;

    }


    return rounds;

}


function getRoundName(size) {

    if (size === 64)
        return "Round of 64";

    if (size === 32)
        return "Round of 32";

    if (size === 16)
        return "Round of 16";

    if (size === 8)
        return "Quarterfinals";

    if (size === 4)
        return "Semifinals";

    if (size === 2)
        return "Final";

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
        document.createElement(
            "div"
        );

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


    match.appendChild(
        playerCard1
    );

    match.appendChild(
        playerCard2
    );


    return match;

}


/* =========================================================
   GET PLAYER FOR SLOT
   ========================================================= */

function getPlayerForSlot(
    roundIndex,
    matchIndex,
    position
) {

    /*
        ROUND 1

        Directly use the players
        entered into the draw.
    */

    if (
        roundIndex === 0
    ) {

        const index =
            matchIndex * 2 +
            position;


        return tournament.players[
            index
        ];

    }


    /*
        LATER ROUNDS

        Automatically get the winner
        from the previous round.
    */

    const previousMatchIndex =
        matchIndex * 2 +
        position;


    const previousWinner =
        tournament.winners[
            `${roundIndex - 1}-${previousMatchIndex}`
        ];


    if (!previousWinner) {

        return null;

    }


    return previousWinner;

}


function createPlayerCard(
    player,
    roundIndex,
    matchIndex,
    position
) {

    const card = document.createElement("div");
    card.className = "player-card";

    const playerIndex = matchIndex * 2 + position;

    const playerData =
        roundIndex === 0
            ? tournament.players[playerIndex]
            : player;


    /* =====================================================
       FIRST ROUND
       ===================================================== */

    if (roundIndex === 0) {

        /* Country / Flag button */

        const flagButton = document.createElement("button");

        flagButton.type = "button";
        flagButton.className = "flag-button";

        if (playerData?.country) {

            /*
                Country has been selected.
                Display the country's flag.
            */

            flagButton.textContent =
                playerData.country.flag;

            flagButton.classList.add("has-flag");

        } else {

            /*
                No country selected.
                Display a blank flag with a +.
            */

            flagButton.innerHTML = `
                <span class="blank-flag">+</span>
            `;

            flagButton.classList.add("empty-flag");

        }

        flagButton.title = "Select country";

        flagButton.addEventListener(
            "click",
            event => {

                event.preventDefault();
                event.stopPropagation();

                openCountrySelector(playerIndex);

            }
        );


        /* Player name */

        const input =
            document.createElement("input");

        input.type = "text";
        input.className = "player-name-input";

        input.placeholder =
            `Player ${playerIndex + 1}`;

        input.value =
            playerData?.name || "";


        /*
            IMPORTANT:
            Stop the player-card click event from
            interfering with typing.
        */

        input.addEventListener(
            "click",
            event => {
                event.stopPropagation();
            }
        );

        input.addEventListener(
            "mousedown",
            event => {
                event.stopPropagation();
            }
        );

        input.addEventListener(
            "input",
            () => {

                tournament.players[playerIndex].name =
                    input.value;

                saveTournament();

            }
        );


        card.appendChild(flagButton);
        card.appendChild(input);

    }


    /* =====================================================
       LATER ROUNDS
       ===================================================== */

    else {

        if (!playerData) {

            card.classList.add("empty-player");

            card.innerHTML = `
                <span>Winner of previous match</span>
            `;

        }

        else {

            const flag =
                document.createElement("span");

            flag.className =
                "player-flag";

            /*
                Carry the player's country through
                every round.
            */

            flag.textContent =
                playerData.country?.flag || "";


            const name =
                document.createElement("span");

            name.className =
                "player-name";

            name.textContent =
                playerData.name ||
                "Unnamed Player";


            card.appendChild(flag);
            card.appendChild(name);

        }

    }


    /* =====================================================
       CLICK TO SELECT WINNER
       ===================================================== */

    if (playerData && playerData.name) {

        card.addEventListener(
            "click",
            () => {

                selectWinner(
                    roundIndex,
                    matchIndex,
                    playerData,
                    card
                );

            }
        );

    }


    /* =====================================================
       HIGHLIGHT WINNER
       ===================================================== */

    const winnerKey =
        `${roundIndex}-${matchIndex}`;

    const winner =
        tournament.winners[winnerKey];


    if (
        winner &&
        playerData &&
        winner.name === playerData.name
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
    player
) {

    const key =
        `${roundIndex}-${matchIndex}`;


    /*
        Deselect if clicking
        the same winner.
    */

    if (
        tournament.winners[key] &&
        tournament.winners[key].name ===
            player.name
    ) {

        delete tournament.winners[
            key
        ];

    }

    else {

        /*
            Save the player AND country.

            This is what allows the flag
            to automatically carry into
            every future round.
        */

        tournament.winners[key] = {

            name:
                player.name,

            country:
                player.country
                    ? {
                        code:
                            player.country.code,

                        name:
                            player.country.name
                    }
                    : null

        };

    }


    /*
        Changing an earlier winner
        invalidates later predictions.
    */

    clearLaterPredictions(
        roundIndex
    );


    saveTournament();

    renderDraw();

}


/* =========================================================
   CLEAR LATER PREDICTIONS
   ========================================================= */

function clearLaterPredictions(
    roundIndex
) {

    Object.keys(
        tournament.winners
    ).forEach(
        key => {

            const [round] =
                key
                    .split("-")
                    .map(Number);


            if (
                round > roundIndex
            ) {

                delete tournament.winners[
                    key
                ];

            }

        }
    );

}


/* =========================================================
   COUNTRY SELECTOR
   ========================================================= */

function openCountrySelector(
    slotIndex
) {

    currentCountrySlot =
        slotIndex;


    countryModal.classList.remove(
        "hidden"
    );


    countrySearch.value =
        "";


    renderCountries();


    setTimeout(
        () => {

            countrySearch.focus();

        },
        50
    );

}


function closeCountrySelector() {

    countryModal.classList.add(
        "hidden"
    );


    currentCountrySlot =
        null;

}


document
    .getElementById(
        "closeCountryModal"
    )
    .addEventListener(
        "click",
        closeCountrySelector
    );


countryModal
    .querySelector(
        ".modal-background"
    )
    .addEventListener(
        "click",
        closeCountrySelector
    );


countrySearch.addEventListener(
    "input",
    renderCountries
);


/* =========================================================
   RENDER COUNTRIES
   ========================================================= */

function renderCountries() {

    const search =
        countrySearch.value
            .trim()
            .toLowerCase();


    countryList.innerHTML =
        "";


    const filtered =
        countries.filter(
            country =>
                country.name
                    .toLowerCase()
                    .includes(search)
        );


    filtered.forEach(
        country => {

            const button =
                document.createElement(
                    "button"
                );

            button.type =
                "button";

            button.className =
                "country-option";


            /*
                ACTUAL FLAG IMAGE
            */

            const flag =
                createFlagImage(
                    country,
                    "country-flag"
                );


            /*
                COUNTRY NAME
            */

            const name =
                document.createElement(
                    "span"
                );

            name.textContent =
                country.name;


            button.appendChild(
                flag
            );

            button.appendChild(
                name
            );


            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    event.stopPropagation();


                    if (
                        currentCountrySlot ===
                        null
                    ) {

                        return;

                    }


                    /*
                        Store the country CODE.

                        The flag image is generated
                        from this code whenever
                        it is displayed.
                    */

                    tournament.players[
                        currentCountrySlot
                    ].country = {

                        code:
                            country.code,

                        name:
                            country.name

                    };


                    saveTournament();

                    closeCountrySelector();

                    renderDraw();

                }
            );


            countryList.appendChild(
                button
            );

        }
    );

}


/* =========================================================
   PREDICTOR NAME
   ========================================================= */

predictorNameInput.addEventListener(
    "input",
    () => {

        if (!tournament) {
            return;
        }


        tournament.predictorName =
            predictorNameInput.value;


        saveTournament();

    }
);


/* =========================================================
   LOCAL STORAGE
   ========================================================= */

function saveTournament() {

    if (!tournament) {
        return;
    }


    localStorage.setItem(
        "badmintonTournament",
        JSON.stringify(
            tournament
        )
    );


    const saveStatus =
        document.getElementById(
            "saveStatus"
        );


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


    if (!saved) {
        return false;
    }


    try {

        tournament =
            JSON.parse(
                saved
            );


        if (
            !tournament.winners
        ) {

            tournament.winners =
                {};

        }


        if (
            !tournament.players
        ) {

            tournament.players =
                [];

        }


        /*
            Convert old player country
            objects into the new format.

            This lets existing saved
            tournaments continue working.
        */

        tournament.players.forEach(
            player => {

                if (
                    player.country
                ) {

                    player.country = {

                        code:
                            player.country.code,

                        name:
                            player.country.name

                    };

                }

            }
        );


        /*
            Also convert winners.
        */

        Object.values(
            tournament.winners
        ).forEach(
            winner => {

                if (
                    winner.country
                ) {

                    winner.country = {

                        code:
                            winner.country.code,

                        name:
                            winner.country.name

                    };

                }

            }
        );


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

function encodeTournament(
    data
) {

    const json =
        JSON.stringify(
            data
        );


    return btoa(
        encodeURIComponent(
            json
        ).replace(
            /%([0-9A-F]{2})/g,
            (_, p1) =>
                String.fromCharCode(
                    parseInt(
                        p1,
                        16
                    )
                )
        )
    );

}


function decodeTournament(
    encoded
) {

    try {

        const json =
            decodeURIComponent(
                Array.prototype.map
                    .call(
                        atob(encoded),
                        char =>
                            "%" +
                            (
                                "00" +
                                char
                                    .charCodeAt(0)
                                    .toString(16)
                            ).slice(-2)
                    )
                    .join("")
            );


        return JSON.parse(
            json
        );

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
        Template:
        remove predictions and predictor.
    */

    if (
        !completedPrediction
    ) {

        data.winners =
            {};

        data.predictorName =
            "";

    }


    const encoded =
        encodeTournament(
            data
        );


    return (
        `${window.location.origin}` +
        `${window.location.pathname}` +
        `?draw=${encoded}`
    );

}


/* =========================================================
   SHARE TEMPLATE
   ========================================================= */

document
    .getElementById(
        "shareTemplateButton"
    )
    .addEventListener(
        "click",
        () => {

            const url =
                generateShareLink(
                    false
                );


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
    .getElementById(
        "sharePredictionButton"
    )
    .addEventListener(
        "click",
        () => {

            const url =
                generateShareLink(
                    true
                );


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
    .getElementById(
        "closeShareModal"
    )
    .addEventListener(
        "click",
        () => {

            shareModal.classList.add(
                "hidden"
            );

        }
    );


shareModal
    .querySelector(
        ".modal-background"
    )
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
    .getElementById(
        "copyShareLink"
    )
    .addEventListener(
        "click",
        async () => {

            try {

                await navigator.clipboard.writeText(
                    shareLink.value
                );


                const button =
                    document.getElementById(
                        "copyShareLink"
                    );


                button.textContent =
                    "Copied!";


                setTimeout(
                    () => {

                        button.textContent =
                            "Copy";

                    },
                    1500
                );

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
   LOAD SHARED DRAW FROM URL
   ========================================================= */

function loadFromURL() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const encoded =
        params.get("draw");


    if (!encoded) {
        return false;
    }


    const decoded =
        decodeTournament(
            encoded
        );


    if (!decoded) {

        alert(
            "This tournament link is invalid."
        );

        return false;

    }


    tournament =
        decoded;


    if (
        !tournament.winners
    ) {

        tournament.winners =
            {};

    }


    if (
        !tournament.players
    ) {

        tournament.players =
            [];

    }


    saveTournament();

    showDrawPage();

    return true;

}


/* =========================================================
   BACK BUTTON
   ========================================================= */

document
    .getElementById(
        "backButton"
    )
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
    .getElementById(
        "resetButton"
    )
    .addEventListener(
        "click",
        () => {

            const confirmed =
                confirm(
                    "Reset this tournament? All predictions will be deleted."
                );


            if (!confirmed) {
                return;
            }


            tournament.winners =
                {};

            tournament.predictorName =
                "";


            predictorNameInput.value =
                "";


            saveTournament();

            renderDraw();

        }
    );


/* =========================================================
   CHAMPION
   ========================================================= */

function updateChampion() {

    const finalRound =
        getRounds(
            tournament.size
        ).length - 1;


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


    championDisplay.innerHTML =
        "";


    const flag =
        createFlagImage(
            champion.country,
            "champion-flag"
        );


    const name =
        document.createElement(
            "span"
        );


    name.textContent =
        champion.name;


    championDisplay.appendChild(
        flag
    );

    championDisplay.appendChild(
        name
    );

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

    if (
        loadFromURL()
    ) {

        return;

    }


    if (
        loadLocalTournament()
    ) {

        showDrawPage();

        return;

    }

}


initialize();

