import type { Decorator, Preview } from '@storybook/nextjs-vite'
import '../build/css/tokens.css'

const withProjectSurface: Decorator = (Story, context) => (
  <div
    style={{
      background: 'var(--color-background-page)',
      color: 'var(--color-text-primary)',
      colorScheme: 'dark',
      fontFamily: 'var(--color-font-family-default)',
      minHeight: '100vh',
      width: context.viewMode === 'docs' ? '100%' : 'min(390px, 100vw)',
    }}
  >
    <Story />
  </div>
)

const preview: Preview = {
  decorators: [withProjectSurface],
  parameters: {
    backgrounds: {
      default: 'page',
      values: [
        {
          name: 'page',
          value: 'var(--color-background-page)',
        },
      ],
    },
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    },
    layout: 'fullscreen',
  },
};

export default preview;