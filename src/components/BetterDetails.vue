<template>
  <details
    class="group mx-auto max-w-3xl border-b border-ink/15 px-2 py-3 lg:px-10"
  >
    <summary
      class="w-full text-ink/65 flex items-align-start justify-between gap-4"
    >
      <span
        class="flex-1 flex flex-wrap group-open:truncate group-open:flex-nowrap group-open:mask-[linear-gradient(to_right,rgba(0,0,0,1)_85%,rgba(0,0,0,0)_100%)]"
      >
        <slot name="summary" />
        <!-- <div
          class="absolute top-0 right-0 h-full w-12 bg-linear-to-r from-transparent to-blue-500  pointer-events-none"
        ></div> -->
      </span>
      <svg
        class="w-5 h-5 shrink-0 transition-transform duration-200 group-open:rotate-180"
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
    <slot />
  </details>
</template>
