<template>
  <details
    class="group mx-auto max-w-3xl border-b border-ink/15 px-2 py-3 lg:px-10"
  >
    <summary
      class="w-full text-ink/65 flex items-align-start justify-between gap-2"
    >
      <div
        class="flex-1 flex flex-wrap group-open:truncate group-open:flex-nowrap group-open:mask-[linear-gradient(to_right,rgba(0,0,0,1)_85%,rgba(0,0,0,0)_100%)]"
      >
        <slot name="summary" />
      </div>
      <svg
        class="w-5 h-5 shrink-0 transition-transform duration-200 group-open:rotate-180"
        xmlns="http://www.w3.org/2000/svg"
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
