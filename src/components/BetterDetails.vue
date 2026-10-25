<template>
  <details class="group mx-auto max-w-3xl border-b border-ink/15 px-2 py-3 lg:px-10">
    <summary
      class="w-full text-ink/65 group-open:truncate list-none flex items-start"
    >
      <slot name="summary"/>
      <svg
        class="w-5 h-5 ml-auto transition-transform duration-200 group-open:rotate-180"
        xmlns="http://w3.org"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </summary>
    <slot/>
  </details>
</template>
