import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import tokens from '../../tokens/tokens.json'
import './foundations.css'

type TokenValue = string | number | Record<string, unknown>
type Token = {
  $type?: string
  $value?: TokenValue
  $description?: string
}

type FlatToken = {
  name: string
  token: Token
  value: TokenValue
}

const source = tokens as Record<string, unknown>

function getAtPath(path: string): unknown {
  return path.split('.').reduce<unknown>((current, part) => {
    if (!current || typeof current !== 'object') return undefined
    return (current as Record<string, unknown>)[part]
  }, source)
}

function resolveValue(value: TokenValue, seen = new Set<string>()): TokenValue {
  if (typeof value !== 'string') return value
  const reference = value.match(/^\{(.+)\}$/)?.[1]
  if (!reference || seen.has(reference)) return value

  const referenced = getAtPath(reference) as Token | undefined
  if (!referenced?.$value) return value
  return resolveValue(referenced.$value, new Set(seen).add(reference))
}

function flattenTokens(value: unknown, path: string[] = []): FlatToken[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return []
  const record = value as Record<string, unknown>
  if ('$value' in record) {
    return [{
      name: path.join('.'),
      token: record as Token,
      value: resolveValue(record.$value as TokenValue),
    }]
  }

  return Object.entries(record).flatMap(([key, child]) => flattenTokens(child, [...path, key]))
}

function cssVariable(name: string) {
  return `var(--color-${name.replaceAll('.', '-')})`
}

function description(token: Token) {
  return token.$description || 'No description provided.'
}

function displayValue(value: TokenValue) {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if ('hex' in value && typeof value.hex === 'string') {
    if ('alpha' in value && typeof value.alpha === 'number') {
      const hex = value.hex.replace('#', '')
      const normalized = hex.length === 3 ? hex.split('').map((char) => char + char).join('') : hex
      const red = Number.parseInt(normalized.slice(0, 2), 16)
      const green = Number.parseInt(normalized.slice(2, 4), 16)
      const blue = Number.parseInt(normalized.slice(4, 6), 16)
      return `rgba(${red}, ${green}, ${blue}, ${value.alpha})`
    }
    return value.hex
  }
  if ('value' in value && 'unit' in value) return `${value.value}${value.unit}`
  return Object.entries(value).map(([key, child]) => `${key}: ${String(child)}`).join(' · ')
}

function dimensionValue(value: TokenValue) {
  if (typeof value === 'object' && 'value' in value && typeof value.value === 'number') return value.value
  return 0
}

function ColorSection() {
  const groups = ['background', 'interactive', 'text', 'border', 'mascot', 'pro', 'accent', 'feedback', 'highlight']

  return (
    <FoundationPage title="Colors" intro="Semantic color tokens and their resolved values.">
      {groups.map((group) => (
        <section className="foundation-group" key={group}>
          <h2>{group}</h2>
          <div className="color-grid">
            {flattenTokens(getAtPath(group), [group]).map(({ name, token, value }) => (
              <article className="color-token" key={name}>
                <div className="swatch" style={{ background: cssVariable(name) }} />
                <div className="token-copy">
                  <code>{name}</code>
                  <strong>{displayValue(value)}</strong>
                  <p>{description(token)}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </FoundationPage>
  )
}

function TypeSection() {
  return (
    <FoundationPage title="Type" intro="Every type style rendered at its resolved size and line height.">
      <div className="type-list">
        {flattenTokens(getAtPath('typeScale'), ['typeScale']).map(({ name, token, value }) => {
          const typography = value as Record<string, unknown>
          const fontSize = dimensionValue(resolveValue(typography.fontSize as TokenValue))
          const lineHeight = dimensionValue(resolveValue(typography.lineHeight as TokenValue))
          const fontFamily = String(resolveValue(typography.fontFamily as TokenValue))
          const fontWeight = String(resolveValue(typography.fontWeight as TokenValue))
          const weight = fontWeight === 'heavy' ? 800 : fontWeight === 'bold' ? 700 : fontWeight === 'semi-bold' ? 600 : 400

          return (
            <article className="type-token" key={name}>
              <div className="type-meta">
                <code>{name}</code>
                <span>{fontSize}px / {lineHeight}px · {fontWeight}</span>
              </div>
              <p className="type-sample" style={{ fontFamily, fontSize, fontWeight: weight, lineHeight: `${lineHeight}px` }}>
                The quick brown fox learns aloud.
              </p>
              <p className="token-description">{description(token)}</p>
            </article>
          )
        })}
      </div>
    </FoundationPage>
  )
}

function SpacingSection() {
  return (
    <FoundationPage title="Spacing" intro="The space scale, shown at proportional widths.">
      <div className="dimension-list">
        {flattenTokens(getAtPath('size.space'), ['size', 'space']).map(({ name, token, value }) => {
          const pixels = dimensionValue(value)
          return (
            <article className="dimension-token" key={name}>
              <div className="dimension-label"><code>{name}</code><strong>{displayValue(value)}</strong></div>
              <div className="space-bar" style={{ width: `${Math.max(pixels, 2)}px` }} />
              <p>{description(token)}</p>
            </article>
          )
        })}
      </div>
    </FoundationPage>
  )
}

function RadiusSection() {
  return (
    <FoundationPage title="Radius" intro="The radius scale, applied to each example box.">
      <div className="radius-grid">
        {flattenTokens(getAtPath('size.radius'), ['size', 'radius']).map(({ name, token, value }) => (
          <article className="radius-token" key={name}>
            <div className="radius-box" style={{ borderRadius: cssVariable(name) }} />
            <code>{name}</code>
            <strong>{displayValue(value)}</strong>
            <p>{description(token)}</p>
          </article>
        ))}
      </div>
    </FoundationPage>
  )
}

function FoundationPage({ title, intro, children }: { title: string; intro: string; children: React.ReactNode }) {
  return (
    <main className="foundations-page">
      <header className="foundations-header">
        <p className="eyebrow">Knowunity foundations</p>
        <h1>{title}</h1>
        <p>{intro}</p>
      </header>
      {children}
    </main>
  )
}

const meta = {
  title: 'Foundations',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Colors: Story = { render: () => <ColorSection /> }
export const Type: Story = { render: () => <TypeSection /> }
export const Spacing: Story = { render: () => <SpacingSection /> }
export const Radius: Story = { render: () => <RadiusSection /> }