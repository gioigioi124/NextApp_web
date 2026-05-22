# AI UI/UX Design Skill Manifesto

> A compact but high-quality design doctrine for AI systems generating modern e-commerce websites, landing pages, dashboards, and product interfaces.
>
> Goal: produce interfaces that feel clean, modern, premium, intuitive, conversion-focused, and visually balanced.

---

# 1. Core Philosophy

## 1.1 Simplicity wins
A beautiful interface is usually:
- simpler than expected
- quieter than expected
- more spacious than expected
- more organized than expected

Do not add visual elements unless they improve:
- clarity
- hierarchy
- usability
- emotional tone
- conversion

Remove decorative noise.

---

## 1.2 Design is communication
Every UI element must answer:
- What is this?
- Why does it matter?
- What should the user do next?

Users should understand the screen within 3–5 seconds.

---

## 1.3 Prioritize clarity over creativity
Readable > artistic.
Usable > impressive.
Conversion > decoration.

A modern commercial interface should feel:
- calm
- confident
- trustworthy
- intentional

---

# 2. Visual Hierarchy

Hierarchy is the foundation of good UI.

The user must instantly know:
1. primary focus
2. secondary information
3. actionable elements
4. supporting content

Hierarchy is created using:
- size
- spacing
- contrast
- font weight
- color emphasis
- positioning

Never make everything equally important.

---

# 3. Whitespace System

Whitespace is not empty.
Whitespace creates:
- focus
- elegance
- readability
- premium feeling
- breathing room

Lack of whitespace makes UI feel:
- cheap
- outdated
- stressful
- amateur

## Rules
- Prefer more spacing over cramped layouts.
- Increase spacing around important sections.
- Use whitespace to separate ideas.
- Large sections should breathe.

---

# 4. Spacing System

Always use a consistent spacing scale.

## Preferred Scale

```txt
4
8
12
16
24
32
48
64
96
```

## Recommended Rule
Use an 8pt system whenever possible.

Examples:
- card padding: 16–24
- section spacing: 48–96
- gap between related items: 8–16
- gap between unrelated sections: 32–64

Never use random values unless justified.

Bad:
```css
padding: 13px;
margin-top: 27px;
```

Good:
```css
padding: 16px;
margin-top: 32px;
```

---

# 5. Margin vs Padding

## Padding
Space INSIDE a component.

Used for:
- buttons
- cards
- inputs
- containers

Padding creates comfort.

---

## Margin
Space OUTSIDE a component.

Used for:
- layout separation
- section structure
- visual grouping

Margin creates composition.

---

## Design Principle
- padding controls internal breathing
- margin controls external rhythm

---

# 6. Border Radius

Modern interfaces use soft corners.

## Recommended

### Buttons
```css
border-radius: 10px–14px;
```

### Cards
```css
border-radius: 14px–20px;
```

### Inputs
```css
border-radius: 10px–12px;
```

---

## Avoid
Too sharp:
```css
border-radius: 2px;
```

Too playful:
```css
border-radius: 999px;
```

Use moderation.

---

# 7. Typography Doctrine

Typography determines perceived quality.

A clean typographic system can make even simple layouts feel premium.

---

## Recommended Fonts
- Inter
- SF Pro
- Manrope
- Poppins
- Geist

---

## Typography Rules

### Limit font sizes
Avoid too many text scales.

Suggested:
```txt
12–14px = secondary text
16px = body text
20–24px = section titles
32–48px = hero titles
```

---

### Use line height generously

```css
line-height: 1.5–1.7;
```

Dense text feels exhausting.

---

### Use weight intentionally
- regular for body
- medium for emphasis
- semibold/bold for hierarchy

Avoid excessive bold usage.

---

# 8. Color System

Good modern UI usually uses:
- neutral background
- limited palette
- one strong accent color

---

## 60-30-10 Rule

- 60% neutral base
- 30% secondary tones
- 10% accent color

---

## Typical Modern Palette

### Background
- white
- off-white
- light gray

### Text
- dark gray
- near-black

### Accent
One dominant action color:
- blue
- violet
- emerald
- orange

---

## Avoid
- too many saturated colors
- rainbow UI
- random gradients everywhere
- overly bright backgrounds

Color should guide attention.
Not compete for attention.

---

# 9. Layout System

Use grids.
Never place elements randomly.

---

## Recommended Container

```css
max-width: 1200px;
margin: 0 auto;
padding: 0 24px;
```

---

## Grid Principles

### Product grids
```css
grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
```

### Gap
```css
gap: 24px;
```

---

## Alignment
Prefer:
- left alignment
- clean baselines
- consistent edge alignment

Misaligned elements instantly reduce perceived quality.

---

# 10. Card Design Principles

Cards are foundational in modern UI.

## Recommended Style

```css
background: white;
border-radius: 16px;
padding: 20px;
box-shadow: 0 4px 12px rgba(0,0,0,0.06);
```

---

## Card Rules
- maintain equal padding
- keep image ratios consistent
- avoid overcrowding
- separate sections clearly
- use subtle shadows only

---

# 11. Shadow System

Modern shadows are subtle.

Good shadow:
```css
box-shadow: 0 4px 12px rgba(0,0,0,0.08);
```

Soft shadows create depth.
Heavy shadows create visual noise.

---

## Avoid
```css
box-shadow: 0 0 40px black;
```

Large dark shadows feel outdated.

---

# 12. Button Design

Buttons are decision triggers.

Primary CTA should dominate.

---

## Recommended

```css
height: 44px;
padding: 0 20px;
border-radius: 12px;
font-weight: 600;
```

---

## CTA Rules
- one primary CTA per section
- strong contrast
- concise wording
- obvious clickability

Examples:
- Buy now
- Add to cart
- Start free trial
- Continue

---

# 13. Modern Animation Principles

Animation should support UX.
Not show off.

---

## Good Motion
Subtle:
```css
transition: 0.2s ease;
transform: translateY(-2px);
```

---

## Avoid
- bouncing
- shaking
- spinning
- excessive glow
- constant movement

Motion fatigue harms usability.

---

# 14. E-commerce UX Priorities

E-commerce exists to reduce friction.

---

## Product Page Priorities
Users care about:
1. image
2. price
3. trust
4. reviews
5. CTA
6. delivery info

Everything else is secondary.

---

## Trust Signals
Include:
- reviews
- guarantees
- secure payment indicators
- delivery estimates
- return policy
- authentic imagery

Trust increases conversion.

---

## Product Cards
Must communicate quickly:
- what product is
- price
- value
- CTA

Avoid clutter.

---

# 15. Mobile-First Thinking

Modern UI must work on mobile first.

---

## Mobile Rules
- large tap targets
- readable typography
- enough spacing
- simplified navigation
- vertical stacking
- sticky CTA when useful

---

## Recommended Sizes
Minimum touch target:
```txt
44x44px
```

---

# 16. Consistency Doctrine

Consistency creates professionalism.

Inconsistent UI feels unreliable.

---

## Keep consistent
- spacing
- button styles
- shadows
- radii
- typography
- icon style
- interaction behavior

Create reusable systems.
Not isolated components.

---

# 17. Information Density

Modern premium interfaces are selective.

Do not overload users.

---

## Principle
Show:
- what matters now
Hide:
- what can wait

Progressive disclosure improves clarity.

---

# 18. Premium UI Characteristics

Premium UI usually has:
- strong spacing
- restrained colors
- excellent typography
- subtle shadows
- soft corners
- simple composition
- visual rhythm
- high consistency
- calmness

It rarely has:
- visual chaos
- too many effects
- excessive gradients
- crowded sections
- aggressive borders

---

# 19. AI Design Behavior Rules

When generating interfaces:

## Always prioritize
1. readability
2. spacing
3. hierarchy
4. consistency
5. accessibility
6. responsiveness
7. conversion clarity

---

## Avoid automatically adding
- unnecessary gradients
- giant hero sections
- excessive animations
- decorative icons everywhere
- random glassmorphism
- overloaded dashboards

Use restraint.

---

# 20. Design Quality Checklist

Before finalizing a UI, verify:

## Layout
- Is spacing consistent?
- Is alignment clean?
- Does the layout breathe?

## Hierarchy
- Is the primary CTA obvious?
- Is attention guided correctly?
- Is information prioritized?

## Typography
- Is text readable?
- Are sizes consistent?
- Is line-height comfortable?

## Color
- Is there one dominant accent?
- Is contrast sufficient?
- Are colors restrained?

## UX
- Is the interface intuitive?
- Is friction minimized?
- Is mobile usability good?

---

# 21. Final Principle

Great UI design is not about adding more.

It is about removing confusion.

The best interfaces feel:
- effortless
- calm
- obvious
- trustworthy
- intentional

Users should never fight the interface.
They should flow through it naturally.

