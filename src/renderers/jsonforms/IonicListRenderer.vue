<script setup lang="ts">
import { IonList, IonItem, IonLabel, IonButton } from '@ionic/vue'
import { ref } from 'vue'

console.log('IonicListRenderer.vue loaded')

const props = defineProps<{
  data: any[]
  path: string
  schema: any
  uischema: any
  handleChange: (path: string, value: any) => void
}>()

let selectedIndex = ref<number | null>(null)

function selectItem(index: number) {
  selectedIndex.value = index
}

function addItem() {
  const itemSchema = props.schema.items
  const newItem = createDefault(itemSchema)

  const newArray = [...props.data, newItem]

  props.handleChange(props.path, newArray)
}

function removeItem(index: number) {
  const newArray = [...props.data]
  newArray.splice(index, 1)

  props.handleChange(props.path, newArray)
}

function createDefault(schema: any): any {
  switch (schema.type) {
    case 'string':
      return schema.default ?? ''
    case 'number':
    case 'integer':
      return schema.default ?? 0
    case 'boolean':
      return schema.default ?? false
    case 'array':
      return []
    case 'object':
      const obj: any = {}
      for (const [key, propSchema] of Object.entries(schema.properties ?? {})) {
        obj[key] = createDefault(propSchema)
      }
      return obj
    default:
      return null
  }
}

</script>
<template lang="pug">
  IonButton(@click="addItem()" v-if="selectedIndex !== null") Add Item
  IonButton(@click="removeItem(selectedIndex)" v-if="selectedIndex !== null") Remove Selected Item
  IonList(inset="true")
    IonItem(
      v-for="(item, index) in props.data"
      :key="index"
      button
      @click="selectItem(index)"
    )
      IonLabel {{ item.name ?? 'Item ' + index }}
</template>
