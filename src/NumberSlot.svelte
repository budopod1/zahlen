<script context="module">
    let selected
</script>

<script>
    import { registerCallback, getCallback } from "./helpers.js"
    import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();
    
    export let value = NaN
    export let target = true
    $: isEmpty = isNaN(value)
    let thisSelected = false

    function change(newValue, destination) {
        value = newValue
        dispatch("afterswap", {
            value, destination
        })
    }
    
    function dragComplete(other) {
        thisSelected = false
        if (!target && other) return
        let current = value
        change(other, false)
        return current
    }
    
    function dragStart(e) {
        e.dataTransfer.setData("text/plain", registerCallback(dragComplete))
    }

    function swap(callback) {
        let newValue = callback(value)
        if (newValue != null) change(newValue, true)
    }
    
    function onDrop(e) {
        swap(getCallback(e.dataTransfer.getData("text/plain")))
    }

    function dragOver(e) {
        if (target) e.preventDefault()
    }

    function click() {
        if (selected) {
            if (thisSelected) {
                thisSelected = false
                selected = null
                return
            }
            if (!target) return
            swap(selected)
            selected = null
        } else {
            thisSelected = true
            selected = dragComplete
        }
    }
</script>

<div class="circle" class:empty={isEmpty} draggable={!isEmpty}
    class:draggable={!isEmpty} on:dragstart={dragStart} on:dragover={dragOver}
    on:drop={onDrop} on:click={click} class:selected={thisSelected}>
    {#if !isEmpty}
        {value}
    {/if}
</div>

<style>
    .circle {
        width: 2em;
        height: 2em;
        border-radius: 100%;
        border: solid 1px black;
        display: inline-flex;
        justify-content: center;
        align-items: center;
    }

    .empty {
        border: dashed 1px black;
    }

    .draggable {
        cursor: grab;
    }

    .selected {
        background-color: #adfc99;
    }
</style>
