// CHANGE EVERY TIME YOU EDIT FIELD
const BRACKET_VERSION = "8.0";

const savedVersion = localStorage.getItem('bracketVersion');
if (savedVersion != BRACKET_VERSION) {
    localStorage.clear();
    localStorage.setItem('bracketVersion', BRACKET_VERSION);
}


const bracket = {
    east: [
        { team1: '1 Duke', team2: '16 Siena', winner: null },
        { team1: '8 Ohio State', team2: '9 TCU', winner: null},
        { team1: '5 St Johns', team2: '12 Northern Iowa', winner: null },
        { team1: '4 Kansas', team2: '13 CA Baptist', winner: null},
        { team1: '6 Louisville', team2: '11 South Florida', winner: null },
        { team1: '3 Michigan St', team2: '14 N Dakota St', winner: null },
        { team1: '7 UCLA', team2: '10 UCF', winner: null },
        { team1: '2 UConn', team2: '15 Furman', winner: null }
    ],

    south: [
        { team1: '1 Florida', team2: '16 Prairie View', winner: null },
        { team1: '8 Clemson', team2: '9 Iowa', winner: null},
        { team1: '5 Vanderbilt', team2: '12 McNeese', winner: null },
        { team1: '4 Nebraska', team2: '13 Troy', winner: null},
        { team1: '6 North Carolina', team2: '11 VCU', winner: null },
        { team1: '3 Illinois', team2: '14 Penn', winner: null },
        { team1: '7 Saint Marys', team2: '10 Texas A&M', winner: null },
        { team1: '2 Houston', team2: '15 Idaho', winner: null }
    ],

    west: [
        { team1: '1 Arizona', team2: '16 Long Island', winner: null },
        { team1: '8 Villanova', team2: '9 Utah State', winner: null },
        { team1: '5 Wisconsin', team2: '12 High Point', winner: null },
        { team1: '4 Arkansas', team2: '13 Hawaii', winner: null },
        { team1: '6 BYU', team2: '11 Texas', winner: null },
        { team1: '3 Gonzaga', team2: '14 Kennesaw St', winner: null },
        { team1: '7 Miami', team2: '10 Missouri', winner: null },
        { team1: '2 Purdue', team2: '15 Queens', winner: null }
    ],

    midwest: [
        { team1: '1 Michigan', team2: '16 Howard', winner: null },
        { team1: '8 Georgia', team2: '9 Saint Louis', winner: null },
        { team1: '5 Texas Tech', team2: '12 Akron', winner: null },
        { team1: '4 Alabama', team2: '13 Hofstra', winner: null },
        { team1: '6 Tennessee', team2: '11 Miami OH', winner: null },
        { team1: '3 Virginia', team2: '14 Wright St', winner: null },
        { team1: '7 Kentucky', team2: '10 Santa Clara', winner: null },
        { team1: '2 Iowa St', team2: '15 Tennessee St', winner: null }
    ]
};

const defaultBracket = JSON.parse(JSON.stringify(bracket));

const picks = {
    east: { r2: [], r3: [], r4: [] },
    south: { r2: [], r3: [], r4: [] },
    west: { r2: [], r3: [], r4: [] },
    midwest: { r2: [], r3: [], r4: [] },
    finalFour: [],
    championship: []
}



let editMode = false;

function toggleEditMode() {
    editMode = !editMode;
    document.getElementById('edit-toggle').textContent = editMode ? 'Done Editing' : 'Edit Teams';
    renderBracket();
}

function resetBracket() {
    if (!confirm('Reset all picks? This cannot be undone.')) return;
    Object.keys(picks).forEach(key => {
        if (typeof picks[key] === 'object' && !Array.isArray(picks[key])) {
            Object.keys(picks[key]).forEach(r => picks[key][r] = []);
        } else {
            picks[key] = [];
        }
    });
    Object.keys(bracket).forEach(region => {
        bracket[region].forEach((m, i) => {
            m.winner = null;
            m.team1 = defaultBracket[region][i].team1;
            m.team2 = defaultBracket[region][i].team2;
        });
    });

    localStorage.removeItem('bracketTeams');
    savePicks();
    renderBracket();
}


const leftSide = document.getElementById("left-side");
const rightSide = document.getElementById("right-side");
const center = document.getElementById("center");

function getNextRound(matchups, region, roundIndex) {
    const winners = matchups.map((m, i) => {
        if (roundIndex == 0) return bracket[region][i].winner;
        const roundKey = ['r2', 'r3', 'r4'][roundIndex - 1];
        return picks[region][roundKey][i]?.winner || null;
    }).filter(w => w !== null);

    const nextRound = [];
    for (let i=0; i < winners.length; i += 2) {
        if (winners[i + 1] !== undefined) {
            nextRound.push({ team1: winners[i], team2: winners[i+1], winner: null});
        }
    }
    return nextRound;
}

function getRoundName(roundIndex) {
    return ['Round of 64', 'Round of 32', 'Sweet 16', 'Elite 8', 'Final Four'][roundIndex] || 'Round';
}

function getRegionWinner(region) {
    const r4 = picks[region].r4;
    return r4[0]?.winner || null;
}


function renderCenter() {
    center.innerHTML = "";

    const southWinner = getRegionWinner('south');
    const westWinner = getRegionWinner('west');
    const eastWinner = getRegionWinner('east');
    const midwestWinner = getRegionWinner('midwest');

    const ff1 = { team1: eastWinner || 'TBD', team2: southWinner || 'TBD', winner: picks.finalFour[0]?.winner || null };
    const ff2 = { team1: westWinner || 'TBD', team2: midwestWinner || 'TBD', winner: picks.finalFour[1]?.winner || null };

    const champTeam1 = picks.finalFour[0]?.winner || 'TBD';
    const champTeam2 = picks.finalFour[1]?.winner || 'TBD';
    const champWinner = picks.championship[0]?.winner || null;

    // build inner flex row
    const inner = document.createElement("div");
    inner.id = "center-inner";

    // LEFT: Final Four 1 (South vs West)
    const leftCol = document.createElement("div");
    leftCol.classList.add("round-col");
    const leftTitle = document.createElement("h3");
    leftTitle.textContent = "Final Four";
    leftCol.appendChild(leftTitle);

    const ff1Div = document.createElement("div");
    ff1Div.classList.add("matchup");
    ff1Div.innerHTML = `
        <div class="team team1 ${ff1.winner === ff1.team1 ? 'selected' : ''}">${ff1.team1}</div>
        <div class="team team2 ${ff1.winner === ff1.team2 ? 'selected' : ''}">${ff1.team2}</div>
    `;
    if (ff1.team1 !== 'TBD' && ff1.team2 !== 'TBD') {
        ff1Div.querySelector('.team1').addEventListener('click', () => {
            picks.finalFour[0] = { winner: ff1.team1 };
            renderBracket(); savePicks();
        });
        ff1Div.querySelector('.team2').addEventListener('click', () => {
            picks.finalFour[0] = { winner: ff1.team2 };
            renderBracket(); savePicks();
        });
    }
    leftCol.appendChild(ff1Div);

    // MIDDLE: Championship
    const midCol = document.createElement("div");
    midCol.classList.add("round-col");
    const midTitle = document.createElement("h3");
    midTitle.textContent = "Championship";
    midCol.appendChild(midTitle);

    const champDiv = document.createElement("div");
    champDiv.classList.add("matchup");
    champDiv.innerHTML = `
        <div class="team team1 ${champWinner === champTeam1 ? 'selected' : ''}">${champTeam1}</div>
        <div class="team team2 ${champWinner === champTeam2 ? 'selected' : ''}">${champTeam2}</div>
    `;
    if (champTeam1 !== 'TBD' && champTeam2 !== 'TBD') {
        champDiv.querySelector('.team1').addEventListener('click', () => {
            picks.championship[0] = { winner: champTeam1 };
            renderBracket(); savePicks();
        });
        champDiv.querySelector('.team2').addEventListener('click', () => {
            picks.championship[0] = { winner: champTeam2 };
            renderBracket(); savePicks();
        });
    }
    midCol.appendChild(champDiv);

    if (champWinner) {
        const championTitle = document.createElement("p");
        championTitle.innerHTML = "🏆 " + champWinner;
        championTitle.style.textAlign = "center";
        championTitle.style.color = "#388e3c";
        championTitle.style.fontWeight = "bold";
        championTitle.style.fontSize = "24px";
        championTitle.style.marginTop = "8px";
        midCol.appendChild(championTitle);
    }

    // RIGHT: Final Four 2 (East vs Midwest)
    const rightCol = document.createElement("div");
    rightCol.classList.add("round-col");
    const rightTitle = document.createElement("h3");
    rightTitle.textContent = "Final Four";
    rightCol.appendChild(rightTitle);

    const ff2Div = document.createElement("div");
    ff2Div.classList.add("matchup");
    ff2Div.innerHTML = `
        <div class="team team1 ${ff2.winner === ff2.team1 ? 'selected' : ''}">${ff2.team1}</div>
        <div class="team team2 ${ff2.winner === ff2.team2 ? 'selected' : ''}">${ff2.team2}</div>
    `;
    if (ff2.team1 !== 'TBD' && ff2.team2 !== 'TBD') {
        ff2Div.querySelector('.team1').addEventListener('click', () => {
            picks.finalFour[1] = { winner: ff2.team1 };
            renderBracket(); savePicks();
        });
        ff2Div.querySelector('.team2').addEventListener('click', () => {
            picks.finalFour[1] = { winner: ff2.team2 };
            renderBracket(); savePicks();
        });
    }
    rightCol.appendChild(ff2Div);

    inner.appendChild(leftCol);
    inner.appendChild(midCol);
    inner.appendChild(rightCol);
    center.appendChild(inner);
}


function renderBracket() {
    leftSide.innerHTML = "";
    rightSide.innerHTML = "";
    center.innerHTML = "";

    const regionSides = {
        east: leftSide,
        south: leftSide,
        west: rightSide,
        midwest: rightSide
    };

    Object.keys(bracket).forEach(region => {
        const target = regionSides[region];
        const regionDiv = document.createElement("div");
        regionDiv.classList.add("region");

        const title = document.createElement("h2");
        title.textContent = region.toUpperCase();
        regionDiv.appendChild(title);

        const roundsContainer = document.createElement("div");
        roundsContainer.classList.add("rounds-container");
        if (region === 'west' || region === 'midwest') {
            roundsContainer.classList.add("right-side-rounds");
        }

        let rounds = [bracket[region]];
        let roundIndex = 0;

        while (true) {
            const next = getNextRound(rounds[rounds.length - 1], region, roundIndex);
            if (next.length == 0) break;
            rounds.push(next);
            roundIndex++;
        }

        rounds.forEach((round, roundIndex) => {
            const roundDiv = document.createElement("div");
            roundDiv.classList.add("round");

            const spacer = Math.pow(2, roundIndex) - 1;
            roundDiv.style.justifyContent = "space-around";
            roundDiv.style.paddingTop = (spacer * 20) + "px";
            roundDiv.style.paddingBottom = (spacer * 20) + "px";

            const roundTitle = document.createElement("h3");
            roundTitle.textContent = getRoundName(roundIndex);
            roundDiv.appendChild(roundTitle);
            
            round.forEach((matchup, matchupIndex) => {
                const matchupDiv = document.createElement("div");
                matchupDiv.classList.add("matchup");

                const winner = roundIndex === 0
                    ? bracket[region][matchupIndex].winner
                    : (picks[region][['r2', 'r3', 'r4'][roundIndex-1]][matchupIndex]?.winner || null);
                
                if (roundIndex === 0 && editMode) {
                    matchupDiv.innerHTML = `
                        <input class="team-input" value="${matchup.team1}"
                            onchange="updateTeam('${region}', ${matchupIndex}, 'team1', this.value)" />
                        <input class="team-input" value="${matchup.team2}"
                            onchange="updateTeam('${region}', ${matchupIndex}, 'team2', this.value)" />
                    `;

                } else {
                    matchupDiv.innerHTML = `
                    <div class="team team1 ${winner === matchup.team1 ? "selected" : ""}">
                        ${matchup.team1}
                    </div>
                    <div class="team team2 ${winner === matchup.team2 ? "selected" : ""}">
                        ${matchup.team2}
                    </div>
                `;
                    matchupDiv.querySelector(".team1").addEventListener("click", () => {
                    selectWinner(region, roundIndex, matchupIndex, matchup.team1);
                    });

                matchupDiv.querySelector(".team2").addEventListener("click", () => {
                    selectWinner(region, roundIndex, matchupIndex, matchup.team2);
                    });
                }

                roundDiv.appendChild(matchupDiv);
            }); 
            roundsContainer.appendChild(roundDiv);  
        });
        regionDiv.appendChild(roundsContainer);
        target.appendChild(regionDiv);
    });
    
    renderCenter();
}

function selectWinner(region, roundIndex, matchupIndex, teamName){
    if (roundIndex == 0) {
        bracket[region][matchupIndex].winner = teamName;
    }
    else {
        const roundKey = ['r2', 'r3', 'r4'][roundIndex-1];
        if (!picks[region][roundKey][matchupIndex]) {
            picks[region][roundKey][matchupIndex] = { team1: null, team2: null, winner: null };
        }
        picks[region][roundKey][matchupIndex].winner = teamName;
    }
    renderBracket();
    savePicks();
}

function savePicks() {
    localStorage.setItem('bracketPicks', JSON.stringify(picks));
    localStorage.setItem('bracketWinners', JSON.stringify(
        Object.keys(bracket).reduce((acc, region) => {
            acc[region] = bracket[region].map(m => m.winner);
            return acc;
        }, {})
    ));
    localStorage.setItem('bracketTeams', JSON.stringify(
        Object.keys(bracket).reduce((acc, region) => {
            acc[region] = bracket[region].map(m => ({ team1: m.team1, team2: m.team2 }));
            return acc;
        }, {})
    ));
}

function loadPicks() {
    const savedPicks = localStorage.getItem('bracketPicks');
    const savedWinners = localStorage.getItem('bracketWinners');

    const savedTeams = localStorage.getItem('bracketTeams');
    if (savedTeams) {
        const parsed = JSON.parse(savedTeams);
        Object.keys(parsed).forEach(region => {
            parsed[region].forEach((teams, i) => {
                bracket[region][i].team1 = teams.team1;
                bracket[region][i].team2 = teams.team2;
            });
        });
    }

    if (savedPicks) {
        const parsed = JSON.parse(savedPicks);
        Object.assign(picks, parsed);
    }

    if (savedWinners) {
        const parsed = JSON.parse(savedWinners);
        Object.keys(parsed).forEach(region => {
            parsed[region].forEach((winner, i) => {
                bracket[region][i].winner = winner;
            });
        });
    }
}

function updateTeam(region, index, teamKey, value) {
    bracket[region][index][teamKey] = value;
    savePicks();
}

loadPicks();
renderBracket();