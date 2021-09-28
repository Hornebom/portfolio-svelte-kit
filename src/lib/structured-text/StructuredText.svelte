<script>
  import { render, renderRule } from 'datocms-structured-text-to-dom-nodes'
  import { isHeading } from 'datocms-structured-text-utils'
  
  export let text

  const options = {
    renderLinkToRecord({ record, children, adapter: { renderNode } }) {
      const href = record._modelApiKey === 'page' ? `/${record.slug}` : '/'
      return renderNode('a', { href }, children)
    },
    customRules: [
      renderRule(
        isHeading,
        ({ adapter: { renderNode }, node, children, key }) => {
          return renderNode(`h${node.level}`, { key, classList: 'class-name' }, children)
        }
      )
    ]
  }

  const nodes = render(text, options)
</script>


{#each nodes as { outerHTML }}
  {@html outerHTML}
{/each}