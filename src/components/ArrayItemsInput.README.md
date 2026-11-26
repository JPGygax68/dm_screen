# ArrayItemsInput

`ArrayItemsInput` renders a configurable number of slots for an array bound with `v-model`.
It does not render a wrapper, so the caller controls the layout and each input.

Each slot receives `index`, `value` (undefined for an unoccupied position), `canEdit`,
`canAdd`, `canRemove`, `addOrUpdate(value)`, and `remove()`. Items can be edited in place,
appended at the first unoccupied position, and removed only from the end. Later empty
positions are disabled until earlier ones are filled. The caller decides how its input
represents adding or removing; empty strings are not reserved by the component.

`slot-count` is a non-negative integer. Reducing it does not truncate existing data:
items beyond the displayed slots remain in the model, but cannot be edited or removed
until enough slots are displayed. Updates replace the array rather than mutating it.

```vue
<ArrayItemsInput v-model="items" :slot-count="3">
  <template #default="{ value, canEdit, canAdd, canRemove, addOrUpdate, remove }">
    <select :value="value" :disabled="!canEdit"
      @change="onChange($event, addOrUpdate, remove)">
      <option v-if="canAdd" value="">Add</option>
      <option v-if="canRemove" value="">Remove</option>
      <option value="one">One</option>
      <option value="two">Two</option>
    </select>
  </template>
</ArrayItemsInput>
```

In this example, `onChange` interprets the empty option as removal and otherwise calls
`addOrUpdate` with the selected value.
