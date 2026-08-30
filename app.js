/* =========================================================
   BADMINTON DRAW BUILDER
   ========================================================= */

let tournament = null;
let selectedDrawSize = 64;
let currentCountrySlot = null;


/* =========================================================
   FLAG IMAGE
   ========================================================= */

/*
    Flag images are used instead of emoji because emoji
    rendering is inconsistent between browsers.

    Chinese Taipei:
    We still use country code TW for data purposes.
*/

function getFlagURL(country) {

    if (!country || !country.code) {
        return null;
    }

    const code = country.code.toLowerCase();

    return `https://flagcdn.com/w40/${code}.png`;
}


/* =========================================================
   COUNTRY LOOKUP
   ========================================================= */

function getCountryByCode(code) {

    if (!code || typeof countries === "undefined") {
        return null;
    }

    return countries.find(
        country =>
            country.code.toUpperCase() ===
            code.toUpperCase()
    ) || null;
}


/*
    Convert saved country data into a compact country object.

    We only need the country code when saving/sharing.
    The full country name and flag can be recovered from
    the countries array.
*/

function compactCountry(country) {

    if (!country || !country.code) {
        return null;
    }

    return country.code.toUpperCase();
}


/*
    Convert a compact country code back into the normal
    country object used by the draw.
*/

function expandCountry(code) {

    if (!code) {
        return null;
    }

    const country =
        getCountryByCode(code);

    if (!country) {
        return {
            code: code,
            name: code,
            flag: ""
        };
    }

    return {
        code: country.code,
        name: country.name,
        flag: country.flag || ""
    };
}


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const homePage =
    document.getElementById("homePage");

const drawPage =
    document.getElementById("drawPage");

const tournamentNameInput =
    document.getElementById("tournamentName");

const createTournamentButton =
    document.getElementById(
        "createTournamentButton"
    );

const drawContainer =
    document.getElementById("drawContainer");

const predictorNameInput =
    document.getElementById("predictorName");

const drawTournamentName =
    document.getElementById(
        "drawTournamentName"
    );

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
    document.getElementById(
        "shareModalTitle"
    );

const shareModalDescription =
    document.getElementById(
        "shareModalDescription"
    );

const championSection =
    document.getElementById(
        "championSection"
    );

const championDisplay =
    document.getElementById(
        "championDisplay"
    );


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
                    .querySelectorAll(
                        ".size-button"
                    )
                    .forEach(btn =>
                        btn.classList.remove(
                            "active"
                        )
                    );

                button.classList.add(
                    "active"
                );

                selectedDrawSize =
                    Number(
                        button.dataset.size
                    );

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

        version: 2,

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

    drawContainer.innerHTML = "";

    const rounds =
        getRounds(
            tournament.size
        );

    rounds.forEach(
        (
            roundSize,
            roundIndex
        ) => {

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

    while (current >= 2) {

        rounds.push(current);

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
   GET PLAYER FOR A SLOT
   ========================================================= */

function getPlayerForSlot(
    roundIndex,
    matchIndex,
    position
) {

    /*
        ROUND 1

        Use the original player list.
    */

    if (roundIndex === 0) {

        const index =
            matchIndex * 2 +
            position;

        return tournament.players[
            index
        ] || null;

    }


    /*
        LATER ROUNDS

        Get the winner from the previous
        round.

        The winner object contains BOTH
        the player name AND country.
        Therefore the flag automatically
        carries through.
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


/* =========================================================
   CREATE FLAG IMAGE
   ========================================================= */

function createFlagImage(
    country,
    className
) {

    if (
        !country ||
        !country.code
    ) {

        return null;

    }

    const img =
        document.createElement(
            "img"
        );

    img.src =
        getFlagURL(
            country
        );

    img.alt =
        country.name ||
        "Country";

    img.className =
        className;

    /*
        Prevent broken-image icon
        from appearing.
    */

    img.onerror = () => {

        img.style.display =
            "none";

    };

    return img;

}


/* =========================================================
   CREATE EMPTY FLAG
   ========================================================= */

function createEmptyFlagButton(
    roundIndex,
    matchIndex,
    position
) {

    const flagButton =
        document.createElement(
            "button"
        );

    flagButton.type =
        "button";

    flagButton.className =
        "flag-button empty-flag";

    flagButton.title =
        "Add country";

    const blankFlag =
        document.createElement(
            "span"
        );

    blankFlag.className =
        "blank-flag";

    blankFlag.textContent =
        "+";

    flagButton.appendChild(
        blankFlag
    );

    flagButton.addEventListener(
        "click",
        event => {

            event.preventDefault();

            event.stopPropagation();

            /*
                Only first-round players
                can have their country changed.
            */

            if (
                roundIndex !== 0
            ) {

                return;

            }

            openCountrySelector(
                matchIndex * 2 +
                position
            );

        }
    );

    return flagButton;

}


/* =========================================================
   CREATE PLAYER CARD
   ========================================================= */

function createPlayerCard(
    player,
    roundIndex,
    matchIndex,
    position
) {

    const card =
        document.createElement(
            "div"
        );

    card.className =
        "player-card";


    /* =====================================================
       FIRST ROUND
       ===================================================== */

    if (
        roundIndex === 0
    ) {

        /*
            ALWAYS SHOW A FLAG BUTTON.

            If the player has no country,
            show the blank + button.

            If the player has a country,
            show the actual flag.
        */

        if (
            player &&
            player.country
        ) {

            const flagButton =
                document.createElement(
                    "button"
                );

            flagButton.type =
                "button";

            flagButton.className =
                "flag-button has-flag";

            flagButton.title =
                `Change country (${player.country.name})`;

            const flag =
                createFlagImage(
                    player.country,
                    "player-flag"
                );

            if (flag) {

                flagButton.appendChild(
                    flag
                );

            }

            flagButton.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    event.stopPropagation();

                    openCountrySelector(
                        matchIndex * 2 +
                        position
                    );

                }
            );

            card.appendChild(
                flagButton
            );

        }

        else {

            /*
                THIS IS THE BLANK FLAG.

                It is ALWAYS rendered,
                including for Player 1.
            */

            const emptyFlag =
                createEmptyFlagButton(
                    roundIndex,
                    matchIndex,
                    position
                );

            card.appendChild(
                emptyFlag
            );

        }


        /* =================================================
           PLAYER NAME INPUT
           ================================================= */

        const input =
            document.createElement(
                "input"
            );

        input.type =
            "text";

        input.className =
            "player-name-input";

        input.placeholder =
            `Player ${
                matchIndex * 2 +
                position +
                1
            }`;

        input.value =
            player?.name || "";


        /*
            Prevent the match from
            interpreting typing as a
            winner selection.
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
            "keydown",
            event => {

                event.stopPropagation();

            }
        );


        input.addEventListener(
            "input",
            () => {

                const playerIndex =
                    matchIndex * 2 +
                    position;

                if (
                    tournament.players[
                        playerIndex
                    ]
                ) {

                    tournament.players[
                        playerIndex
                    ].name =
                        input.value;

                }

                saveTournament();

            }
        );

        card.appendChild(
            input
        );

    }


    /* =====================================================
       LATER ROUNDS
       ===================================================== */

    else {

        if (!player) {

            card.classList.add(
                "empty-player"
            );

            const text =
                document.createElement(
                    "span"
                );

            text.textContent =
                "Winner of previous match";

            card.appendChild(
                text
            );

        }

        else {

            /*
                FLAG AUTOMATICALLY
                CARRIES FROM THE WINNER.
            */

            if (
                player.country
            ) {

                const flag =
                    createFlagImage(
                        player.country,
                        "player-flag"
                    );

                if (flag) {

                    card.appendChild(
                        flag
                    );

                }

            }


            /*
                PLAYER NAME
            */

            const name =
                document.createElement(
                    "span"
                );

            name.className =
                "player-name";

            name.textContent =
                player.name ||
                "Unnamed Player";

            card.appendChild(
                name
            );

        }

    }


    /* =====================================================
       CLICK TO SELECT WINNER
       ===================================================== */

    if (
        player &&
        player.name
    ) {

        card.addEventListener(
            "click",
            event => {

                /*
                    Don't select a winner when
                    clicking the input or flag.
                */

                if (
                    event.target.tagName ===
                    "INPUT"
                ) {

                    return;

                }

                if (
                    event.target.closest(
                        "button"
                    )
                ) {

                    return;

                }

                selectWinner(
                    roundIndex,
                    matchIndex,
                    player
                );

            }
        );

    }


    /* =====================================================
       WINNER HIGHLIGHT
       ===================================================== */

    const winnerKey =
        `${roundIndex}-${matchIndex}`;

    const winner =
        tournament.winners[
            winnerKey
        ];

    if (
        winner &&
        player &&
        winner.name === player.name
    ) {

        card.classList.add(
            "winner"
        );

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
        Clicking the selected winner
        again removes the prediction.
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
            IMPORTANT:

            Store the country together
            with the winner.

            This is what makes the flag
            carry into the next round.
        */

        tournament.winners[key] = {

            name:
                player.name,

            country:
                player.country
                    ? {
                        ...player.country
                    }
                    : null

        };

    }


    /*
        If an earlier winner changes,
        predictions in later rounds
        become invalid.
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
    ).forEach(key => {

        const [round] =
            key
                .split("-")
                .map(Number);

        if (
            round >
            roundIndex
        ) {

            delete tournament.winners[
                key
            ];

        }

    });

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


/* =========================================================
   CLOSE COUNTRY MODAL
   ========================================================= */

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


/* =========================================================
   COUNTRY SEARCH
   ========================================================= */

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
                FLAG IMAGE
            */

            const flag =
                createFlagImage(
                    country,
                    "country-flag"
                );

            if (flag) {

                button.appendChild(
                    flag
                );

            }


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
                name
            );


            /*
                SELECT COUNTRY
            */

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
                        Save the COMPLETE
                        country object locally.

                        This is important because
                        the draw immediately needs
                        the country information.
                    */

                    tournament.players[
                        currentCountrySlot
                    ].country = {

                        code:
                            country.code,

                        name:
                            country.name,

                        flag:
                            country.flag || ""

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
            !tournament.players
        ) {

            return false;

        }


        if (
            !tournament.winners
        ) {

            tournament.winners =
                {};

        }


        /*
            Make sure old player data
            still works.
        */

        tournament.players =
            tournament.players.map(
                player => {

                    if (!player) {

                        return {
                            name: "",
                            country: null
                        };

                    }

                    if (
                        typeof player.country ===
                        "string"
                    ) {

                        player.country =
                            expandCountry(
                                player.country
                            );

                    }

                    return player;

                }
            );


        /*
            Upgrade older winner
            country codes if necessary.
        */

        Object.keys(
            tournament.winners
        ).forEach(key => {

            const winner =
                tournament.winners[
                    key
                ];

            if (
                winner &&
                typeof winner.country ===
                    "string"
            ) {

                winner.country =
                    expandCountry(
                        winner.country
                    );

            }

        });


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
   COMPACT SHARE DATA
   ========================================================= */

/*
    The old system stored a lot of unnecessary information.

    Example:

    {
        name: "",
        country: {
            code: "CA",
            name: "Canada",
            flag: "🇨🇦"
        }
    }

    We now store:

    ["", "CA"]

    This makes the URL significantly shorter.
*/


function createShareData(
    completedPrediction
) {

    const data = {

        v: 2,

        n:
            tournament.tournamentName,

        s:
            tournament.size,

        p:
            tournament.players.map(
                player => {

                    return [

                        player?.name || "",

                        compactCountry(
                            player?.country
                        )

                    ];

                }
            )

    };


    /*
        Only include prediction
        information when sharing
        a completed prediction.
    */

    if (
        completedPrediction
    ) {

        data.w =
            {};

        Object.keys(
            tournament.winners
        ).forEach(key => {

            const winner =
                tournament.winners[
                    key
                ];

            data.w[key] = [

                winner.name || "",

                compactCountry(
                    winner.country
                )

            ];

        });

        data.r =
            tournament.predictorName ||
            "";

    }


    return data;

}


/* =========================================================
   EXPAND SHARE DATA
   ========================================================= */

function expandShareData(
    data
) {

    /*
        NEW COMPACT FORMAT
    */

    if (
        data &&
        data.v === 2 &&
        Array.isArray(data.p)
    ) {

        const players =
            data.p.map(
                item => {

                    return {

                        name:
                            item?.[0] ||
                            "",

                        country:
                            expandCountry(
                                item?.[1]
                            )

                    };

                }
            );


        const winners =
            {};

        if (
            data.w
        ) {

            Object.keys(
                data.w
            ).forEach(key => {

                const item =
                    data.w[key];

                winners[key] = {

                    name:
                        item?.[0] ||
                        "",

                    country:
                        expandCountry(
                            item?.[1]
                        )

                };

            });

        }


        return {

            version: 2,

            tournamentName:
                data.n || "Tournament",

            size:
                Number(data.s) || 32,

            players:
                players,

            winners:
                winners,

            predictorName:
                data.r || ""

        };

    }


    /*
        OLD FORMAT

        This lets links generated
        by your previous app.js
        continue working.
    */

    if (
        data &&
        data.players
    ) {

        data.players =
            data.players.map(
                player => {

                    if (
                        player &&
                        typeof player.country ===
                            "string"
                    ) {

                        player.country =
                            expandCountry(
                                player.country
                            );

                    }

                    return player;

                }
            );


        if (!data.winners) {

            data.winners =
                {};

        }


        Object.keys(
            data.winners
        ).forEach(key => {

            const winner =
                data.winners[key];

            if (
                winner &&
                typeof winner.country ===
                    "string"
            ) {

                winner.country =
                    expandCountry(
                        winner.country
                    );

            }

        });


        return data;

    }


    return null;

}


/* =========================================================
   URL-SAFE BASE64
   ========================================================= */

/*
    Normal Base64 can contain:

        +
        /
        =

    Those characters are problematic
    inside URLs.

    URL-safe Base64 replaces them with:

        -
        _
        (removed padding)

    This fixes the "invalid tournament"
    problem from your previous links.
*/


function uint8ToBase64Url(
    bytes
) {

    let binary = "";

    const chunkSize =
        0x8000;

    for (
        let i = 0;
        i < bytes.length;
        i += chunkSize
    ) {

        binary += String.fromCharCode(
            ...bytes.subarray(
                i,
                Math.min(
                    i + chunkSize,
                    bytes.length
                )
            )
        );

    }

    return btoa(binary)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");

}


function base64UrlToUint8(
    value
) {

    const base64 =
        value
            .replace(/-/g, "+")
            .replace(/_/g, "/");

    const padded =
        base64 +
        "=".repeat(
            (4 - base64.length % 4) % 4
        );

    const binary =
        atob(padded);

    const bytes =
        new Uint8Array(
            binary.length
        );

    for (
        let i = 0;
        i < binary.length;
        i++
    ) {

        bytes[i] =
            binary.charCodeAt(i);

    }

    return bytes;

}


/* =========================================================
   TEXT ENCODING
   ========================================================= */

function stringToBytes(
    text
) {

    return new TextEncoder().encode(
        text
    );

}


function bytesToString(
    bytes
) {

    return new TextDecoder().decode(
        bytes
    );

}


/* =========================================================
   COMPRESS DATA
   ========================================================= */

/*
    Modern browsers support CompressionStream.

    This compresses the JSON before putting it
    into the URL.

    This makes large R64 tournament links
    considerably shorter.

    If compression isn't supported,
    we automatically fall back to
    normal URL-safe Base64.
*/


async function encodeTournament(
    data
) {

    const json =
        JSON.stringify(data);

    const bytes =
        stringToBytes(json);


    /*
        Try gzip compression.
    */

    if (
        typeof CompressionStream !==
        "undefined"
    ) {

        try {

            const stream =
                new Blob([bytes])
                    .stream()
                    .pipeThrough(
                        new CompressionStream(
                            "gzip"
                        )
                    );

            const compressed =
                new Uint8Array(
                    await new Response(
                        stream
                    ).arrayBuffer()
                );

            /*
                Prefix "g" means gzip.
            */

            return (
                "g" +
                uint8ToBase64Url(
                    compressed
                )
            );

        }

        catch (error) {

            console.warn(
                "Compression failed, using fallback.",
                error
            );

        }

    }


    /*
        Fallback:

        Prefix "j" means regular JSON.
    */

    return (
        "j" +
        uint8ToBase64Url(
            bytes
        )
    );

}


/* =========================================================
   DECOMPRESS DATA
   ========================================================= */

async function decodeTournament(
    encoded
) {

    try {

        if (
            !encoded ||
            encoded.length < 2
        ) {

            return null;

        }


        const type =
            encoded.charAt(0);

        const payload =
            encoded.substring(1);

        const bytes =
            base64UrlToUint8(
                payload
            );


        /*
            GZIP COMPRESSED DATA
        */

        if (
            type === "g"
        ) {

            if (
                typeof DecompressionStream ===
                "undefined"
            ) {

                throw new Error(
                    "This browser does not support decompression."
                );

            }

            const stream =
                new Blob([bytes])
                    .stream()
                    .pipeThrough(
                        new DecompressionStream(
                            "gzip"
                        )
                    );

            const decompressed =
                new Uint8Array(
                    await new Response(
                        stream
                    ).arrayBuffer()
                );

            const json =
                bytesToString(
                    decompressed
                );

            return JSON.parse(
                json
            );

        }


        /*
            NORMAL JSON
        */

        if (
            type === "j"
        ) {

            const json =
                bytesToString(
                    bytes
                );

            return JSON.parse(
                json
            );

        }


        /*
            OLD LINKS

            Your previous app.js did not
            have a prefix.

            Try decoding it as normal
            Base64 JSON.
        */

        return decodeOldTournament(
            encoded
        );

    }

    catch (error) {

        console.error(
            "Could not decode tournament:",
            error
        );

        /*
            Last attempt:
            treat it as an old link.
        */

        return decodeOldTournament(
            encoded
        );

    }

}


/* =========================================================
   DECODE OLD TOURNAMENT LINKS
   ========================================================= */

function decodeOldTournament(
    encoded
) {

    try {

        /*
            Old links were normal Base64.
        */

        const base64 =
            encoded
                .replace(/-/g, "+")
                .replace(/_/g, "/");

        const padded =
            base64 +
            "=".repeat(
                (4 - base64.length % 4) % 4
            );

        const binary =
            atob(padded);

        let encodedString =
            "";

        for (
            let i = 0;
            i < binary.length;
            i++
        ) {

            encodedString +=
                "%" +
                (
                    "00" +
                    binary
                        .charCodeAt(i)
                        .toString(16)
                ).slice(-2);

        }

        const json =
            decodeURIComponent(
                encodedString
            );

        return JSON.parse(
            json
        );

    }

    catch (error) {

        console.error(
            "Old tournament link could not be decoded:",
            error
        );

        return null;

    }

}


/* =========================================================
   GENERATE SHARE LINK
   ========================================================= */

async function generateShareLink(
    completedPrediction
) {

    const data =
        createShareData(
            completedPrediction
        );

    const encoded =
        await encodeTournament(
            data
        );

    const url =
        `${window.location.origin}${window.location.pathname}?draw=${encoded}`;

    return url;

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
        async () => {

            const button =
                document.getElementById(
                    "shareTemplateButton"
                );

            const originalText =
                button.textContent;

            button.textContent =
                "Creating...";

            try {

                const url =
                    await generateShareLink(
                        false
                    );

                openShareModal(
                    "Share Tournament Template",
                    "Send this link to someone. They can enter their name and complete the draw.",
                    url
                );

            }

            catch (error) {

                console.error(
                    error
                );

                alert(
                    "Could not create the tournament link."
                );

            }

            finally {

                button.textContent =
                    originalText;

            }

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
        async () => {

            const button =
                document.getElementById(
                    "sharePredictionButton"
                );

            const originalText =
                button.textContent;

            button.textContent =
                "Creating...";

            try {

                const url =
                    await generateShareLink(
                        true
                    );

                openShareModal(
                    "Share Completed Prediction",
                    "Send this link to share your completed tournament prediction.",
                    url
                );

            }

            catch (error) {

                console.error(
                    error
                );

                alert(
                    "Could not create the tournament link."
                );

            }

            finally {

                button.textContent =
                    originalText;

            }

        }
    );


/* =========================================================
   OPEN SHARE MODAL
   ========================================================= */

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

            const button =
                document.getElementById(
                    "copyShareLink"
                );

            try {

                await navigator.clipboard.writeText(
                    shareLink.value
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

        }
    );


/* =========================================================
   LOAD SHARED DRAW FROM URL
   ========================================================= */

async function loadFromURL() {

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
        await decodeTournament(
            encoded
        );

    if (!decoded) {

        alert(
            "This tournament link is invalid or corrupted."
        );

        return false;

    }

    const expanded =
        expandShareData(
            decoded
        );

    if (!expanded) {

        alert(
            "This tournament link is invalid."
        );

        return false;

    }

    tournament =
        expanded;


    /*
        Make sure all required
        properties exist.
    */

    if (
        !tournament.players
    ) {

        alert(
            "This tournament link is invalid."
        );

        return false;

    }

    if (
        !tournament.winners
    ) {

        tournament.winners =
            {};

    }

    if (
        !tournament.predictorName
    ) {

        tournament.predictorName =
            "";

    }


    /*
        Store the shared tournament
        locally too.
    */

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


    /*
        CHAMPION FLAG
    */

    if (
        champion.country
    ) {

        const flag =
            createFlagImage(
                champion.country,
                "champion-flag"
            );

        if (flag) {

            championDisplay.appendChild(
                flag
            );

        }

    }


    /*
        CHAMPION NAME
    */

    const name =
        document.createElement(
            "span"
        );

    name.textContent =
        champion.name;

    championDisplay.appendChild(
        name
    );

}


/* =========================================================
   INITIALIZE
   ========================================================= */

async function initialize() {

    /*
        Priority:

        1. Shared URL
        2. Existing local tournament
        3. Home page
    */

    if (
        await loadFromURL()
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


/* =========================================================
   START APP
   ========================================================= */

initialize();