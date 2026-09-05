<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { getActivePinia } from 'pinia';

const route = useRoute();

// Dynamically locate the instantiated store instance out of the running Pinia registry
const store = computed(() => {
  const pinia = getActivePinia();
  // Look up the store by the title ID assigned in your schema factory
  return (pinia as any)?._s.get('generic-dmscreen-store') || (pinia as any)?._s.get('DMScreen Data Schema');
});

interface Crumb {
  label: string;
  path: string;
}

function findEntityDisplayLabel(entity: any): string {
  if (!entity) return 'Loading...';
  return entity.name || entity.title || entity.label || entity.id || 'Untitled Record';
}

const crumbs = computed<Crumb[]>(() => {
  const trail: Crumb[] = [];
  
  // Guard access in case store isn't hydrated immediately
  if (!store.value) return trail;
  let searchContext: any = store.value;

  route.matched.forEach((match) => {
    if (match.path === '/' || match.path === '/:pathMatch(.*)*') return;

    let runtimePath = match.path;
    Object.keys(route.params).forEach((paramKey) => {
      runtimePath = runtimePath.replace(`:${paramKey}`, String(route.params[paramKey]));
    });

    const segments = match.path.split('/');
    const currentSegment = segments[segments.length - 1];

    if (currentSegment.startsWith(':')) {
      const idParamName = currentSegment.substring(1);
      const currentId = route.params[idParamName];

      if (currentId && Array.isArray(searchContext)) {
        const activeEntity = searchContext.find((item: any) => item.id === currentId);
        if (activeEntity) {
          trail.push({
            label: findEntityDisplayLabel(activeEntity),
            path: runtimePath
          });
          searchContext = activeEntity;
        }
      }
    } else if (currentSegment) {
      const listLabel = currentSegment.charAt(0).toUpperCase() + currentSegment.slice(1);
      
      trail.push({
        label: listLabel,
        path: runtimePath
      });

      if (searchContext && searchContext[currentSegment]) {
        searchContext = searchContext[currentSegment];
      }
    }
  });

  return trail;
});
</script>
