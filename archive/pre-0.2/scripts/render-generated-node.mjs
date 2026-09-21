
export function renderGeneratedNode(node, depth = 0) {
  const indent = '  '.repeat(depth);
  const lines = [];

  if (!node || typeof node !== 'object') {
    return lines;
  }

  if (node.kind === 'layout') {
    if (node.uiType === 'Group') {
      lines.push(`${indent}ion-card.form-spec-group`);
      if (node.label) {
        lines.push(`${indent}  ion-card-header`);
        lines.push(`${indent}    ion-card-title ${escapeForPugText(node.label)}`);
      }
      lines.push(`${indent}  ion-card-content`);
      for (const child of node.elements || []) {
        lines.push(...renderGeneratedNode(child, depth + 2));
      }
      return lines;
    }

    lines.push(`${indent}div.form-spec-layout`);
    for (const child of node.elements || []) {
      lines.push(...renderGeneratedNode(child, depth + 1));
    }
    return lines;
  }

  if (node.kind === 'field') {
    const path = jsString(node.path || '');
    const label = escapeForPugText(node.label || node.path || 'Field');
    const placeholder = jsString(node.placeholder || '');
    const rowCount = Number(node.options?.rows || 3);
    const isMultiline = Boolean(node.options?.multi);

    lines.push(`${indent}ion-item.form-spec-field(lines="none")`);
    lines.push(`${indent}  ion-label(position="stacked") ${label}`);
    if (isMultiline) {
      lines.push(
        `${indent}  ion-textarea(:value='getValueAtPath(data, ${path})' :rows='${rowCount}' :placeholder='${placeholder}' @ionInput='(event) => emitFieldUpdate(${path}, event)')`
      );
    } else {
      lines.push(
        `${indent}  ion-input(:value='getValueAtPath(data, ${path})' :placeholder='${placeholder}' @ionInput='(event) => emitFieldUpdate(${path}, event)')`
      );
    }
    lines.push(`${indent}ion-note.form-spec-error(v-if='errorByPath[${path}]' color="danger") {{ errorByPath[${path}] }}`);
    return lines;
  }

  lines.push(`${indent}ion-note(color="warning") Unsupported form node: ${escapeForPugText(node.uiType || 'unknown')}`);
  return lines;
}

// Helper functions

function escapeForPugText(value) {
  return String(value ?? '').replace(/\n/g, ' ').trim();
}

function jsString(value) {
  return JSON.stringify(String(value ?? ''));
}

