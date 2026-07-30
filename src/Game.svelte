<!-- 03:16:54 -->

<script>
    import { ops, opsFunc } from "./puzzle.js"
    import NumberSlot from "./NumberSlot.svelte"
    import { createEventDispatcher } from 'svelte'

    export let progress
    
	const dispatch = createEventDispatcher()
    let difficulty = 1
    let difficultyNames = ["Easy", "Medium", "Hard", "Very Hard"]
    let target
    let avaliableHistory
    
    let opResult = ops.map(()=>NaN)
    let operand1History
    let operand2History
    
    let operand1
    let operand2
    let avaliable

    export function updateFromProgress(..._) {
        let dprogress = progress["d"+difficulty]
        operand1History = structuredClone(dprogress.operand1History)
        operand2History = structuredClone(dprogress.operand2History)
        avaliableHistory = structuredClone(dprogress.avaliableHistory)
        target = dprogress.target
        operand1 = [...operand1History.at(-1)]
        operand2 = [...operand2History.at(-1)]
        avaliable = [...avaliableHistory.at(-1)]
    }

    $: updateFromProgress(difficulty)
    
    $: opResult = [...Array(ops.length).keys()].map(
        (i) => opsFunc[ops[i]](operand1[i], operand2[i])
    )

    function updateOperands(i) {
        operand1[i] = NaN
        operand2[i] = NaN
    }

    function updateProgress() {
        dispatch("updateprogress", {difficulty, progress: {
            operand1History, operand2History, avaliableHistory, target
        }})
    }

    $: won = opResult.includes(target)
    
    function updateHistory(e, manual=false) {
        if (manual || e.detail.destination) {
            avaliableHistory.push([...avaliable])
            operand1History.push([...operand1])
            operand2History.push([...operand2])
            updateProgress()
        }
    }

    function undo() {
        if (avaliableHistory.length > 1) {
            avaliableHistory.pop()
            operand1History.pop()
            operand2History.pop()
            avaliable = avaliableHistory.at(-1)
            operand1 = operand1History.at(-1)
            operand2 = operand2History.at(-1)
            updateProgress()
        }
    }

    function requestReset() {
        dispatch("requestreset", {difficulty})
    }

    let opIcons = {
        "+": "plus", "-": "dash", "*": "x", "/": "slash"
    }
</script>

<main class="game-main">
    <nav>
        {#each difficultyNames as difficultyName, i}
            <button on:click={()=>{difficulty = i+1}} 
                class:nav-selected={i+1==difficulty}>
                {difficultyName}
            </button>
        {/each}
    </nav>
    {#if won}
        <section class="won">
            <div>
                <h1>Congrats</h1>
                <p>Come back tomorrow for another puzzle.</p>
            </div>
        </section>
    {:else}
        <section class="topper">
            <button class="reload" on:click={undo}>
                <i class="bi bi-backspace"></i> Undo
            </button>
            <div class="target">
                Target: <span class="target-num">{target}</span>
            </div>
            <button class="reset" on:click={requestReset}>
                <i class="bi bi-arrow-clockwise"></i> Reset
            </button>
        </section>
        <section class="numbers-ops option-grid">
            {#each ops as op, i}
                <div class="op-option">
                    <NumberSlot bind:value="{operand1[i]}"
                        on:afterswap={updateHistory}/> 
                    <i class={"bi bi-"+opIcons[op]}></i>
                    <NumberSlot bind:value="{operand2[i]}"
                        on:afterswap={updateHistory}/> 
                    <span>&nbsp;=&nbsp;</span>
                    <NumberSlot bind:value="{opResult[i]}" target={false} 
                        on:afterswap={updateHistory}
                        on:afterswap={()=>updateOperands(i)}/> 
                </div>
            {/each}
        </section>
        <section class="numbers-source option-grid">
            {#each avaliable as number}
                <NumberSlot bind:value="{number}" on:afterswap={updateHistory}/>
            {/each}
        </section>
    {/if}
</main>

<style>
    .game-main {
        flex-grow: 1;
        display: grid;
        grid-template-columns: auto auto;
        grid-template-rows: auto auto 1fr;
        grid-template-areas: 
            ". ."
            "a a"
            "a a"
            "a a";
        gap: 1em;
    }

    .won {
        grid-area: a;
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
    }

    nav {
        grid-column: 1 / 3;
        grid-row: 1;
        display: flex;
    }

    nav button {
        flex-grow: 1;
        border-bottom: solid 1px black;
        padding: 1px;
        padding-bottom: 0;
    }

    .nav-selected {
        /*
        border-bottom: none;
        border-top: solid 1px black;
        border-left: solid 1px black;
        border-right: solid 1px black;
        */
        border: solid 1px black;
        border-bottom: none;
        padding: 0;
        padding-bottom: 1px;
    }

    .topper {
        grid-column: 1 / 3;
        grid-row: 2;
        display: grid;
        grid-template-rows: auto 0px;
        grid-template-columns: 5em 1fr 5em;
        grid-template-areas: 
            "a a a"
            ". . .";
    }

    .target {
        text-align: center;
        font-size: 1.5em;
        grid-area: a;
    }

    .target-num {
        text-decoration: underline;
    }

    .reload {
        grid-column: 1;
        grid-row: 1;
    }

    .reset {
        grid-column: 3;
        grid-row: 1;
    }

    .reload, .reset {
        height: 100%;
        width: 100%;
        display: inline-block;
    }

    button {
        z-index: 1;
        cursor: pointer;
        background-color: transparent;
        border: none;
    }

    .numbers-ops {
        grid-row: 3;
        grid-column: 1;
    }

    .numbers-source {
        grid-row: 3;
        grid-column: 2;
    }
    
    .numbers-source, .numbers-ops {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-auto-rows: auto;
        justify-items: center;
        align-items: center;
        gap: 1em;
        user-select: none;
    }

    @media (max-aspect-ratio: 1 / 1.5) {
        .numbers-source {
            grid-template-columns: 1fr;
        }
        
        .topper {
            grid-template-rows: auto auto;
            grid-template-areas: 
                ". . ."
                "a a a";
        }
    }

    @media (max-aspect-ratio: 4 / 3) {
        .numbers-ops {
            grid-template-columns: 1fr;
        }
    }

    .op-option {
        display: flex;
        align-items: center;
    }
</style>
