<script>
  import { phase, sceneState } from '$lib/store/store';

  $: if ($sceneState >= 4) {
    phase.set('output');
  }
</script>

<div class="screen">
  <p class="status">
    calculating conception coordinates<span class="dots"></span>
  </p>
</div>

<style>
  .screen {
    background: var(--bg-t);
    border: solid 1px var(--fg-faint);
    backdrop-filter: blur(5px);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: 420px; 
    padding: 2rem;
  }

  .status {
    font-size: 11px;
    color: var(--fg-dim);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    text-align: center;
    /* Fixed width or inline-block prevents the text from jumping 
       as the dots change the element's width */
    display: inline-block;
  }

  .dots::after {
    content: '';
    display: inline-block;
    width: 12px; /* Set width to fit 3 dots to prevent layout shift */
    text-align: left;
    animation: ellipsis 1.5s infinite steps(4);
  }

  @keyframes ellipsis {
    0% { content: ''; }
    25% { content: '.'; }
    50% { content: '..'; }
    75% { content: '...'; }
    100% { content: ''; }
  }
</style>