<script>
    import Game from "./Game.svelte";
    import { jsonStringify, jsonParse } from "./helpers.js";
    import { getPuzzle, difficultyLevels, ops } from "./puzzle.js";

    let game;

    let unixTime = Date.now() / 1000;
    let days = Math.floor(unixTime / (60 * 60 * 24));

    let storedDays = parseInt(localStorage.getItem("days"));
    if (storedDays != days) localStorage.removeItem("progress");

    function getHistory(difficulty) {
        let [target, avaliable] = getPuzzle(days, difficulty);
        return {
            avaliableHistory: [avaliable],
            operand1History: [ops.map(() => NaN)],
            operand2History: [ops.map(() => NaN)],
            won: false,
            target,
        };
    }

    function resetDifficulty(e) {
        updateProgress(e.detail.difficulty, getHistory(e.detail.difficulty));
        game.updateFromProgress();
    }

    if (!localStorage.getItem("progress")) {
        console.log("!!!");
        localStorage.setItem("days", days.toString());
        let progress = {};
        for (let i = 1; i <= difficultyLevels; i++) {
            progress["d" + i] = getHistory(i);
        }
        localStorage.setItem("progress", jsonStringify(progress));
    }

    let progress = jsonParse(localStorage.getItem("progress"));

    function updateProgressE(e) {
        updateProgress(e.detail.difficulty, e.detail.progress);
    }

    function updateProgress(difficulty, progressSegment) {
        progress["d" + difficulty] = progressSegment;
        localStorage.setItem("progress", jsonStringify(progress));
        progress = progress;
    }
</script>

<div class="base">
    <h1>Zahlen</h1>
    <Game
        {progress}
        on:updateprogress={updateProgressE}
        on:requestreset={resetDifficulty}
        bind:this={game}
    />
</div>

<style>
    .base {
        padding: 0.5em;
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        font-size: 4vw;
    }

    @media (max-aspect-ratio: 1 / 1.5) {
        .base {
            font-size: 7vw;
        }
    }
</style>
