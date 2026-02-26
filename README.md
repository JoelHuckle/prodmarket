# prod_market

# 🎨 Design System - Dark Mode Blue

**Minimal • Dark Mode • Blue Primary • Rounded Corners**

## 📦 What's Included

### Config & Styles
- `tailwind.config.js` - Color tokens, typography, spacing, animations
- `index.css` - Base styles, utility classes, component classes

### UI Components (12 components)
- `Button.jsx` - Primary, secondary, outline, ghost, danger variants
- `Input.jsx` - Text input with label, error, hint, icon
- `Textarea.jsx` - Multi-line input
- `Select.jsx` - Dropdown select
- `Card.jsx` - Card with header, content, footer
- `Badge.jsx` - Status badges
- `Avatar.jsx` - User avatars with fallback initials
- `Modal.jsx` - Dialog/popup
- `Spinner.jsx` - Loading states + skeleton
- `Toast.jsx` - Notifications
- `Tabs.jsx` - Tab navigation
- `EmptyState.jsx` - Empty/no-data state

### Demo
- `DesignSystem.jsx` - Preview all components

---

## 🚀 Installation

### Step 1: Install Dependencies

```bash
npm install lucide-react
```

### Step 2: Replace Tailwind Config

Copy `tailwind.config.js` to your project root (replace existing):

```bash
cp tailwind.config.js your-project/tailwind.config.js
```

### Step 3: Replace CSS

Copy `index.css` to your `src/` folder:

```bash
cp index.css your-project/src/index.css
```

### Step 4: Copy Components

Copy the `ui-components/` folder to your `src/components/`:

```bash
cp -r ui-components your-project/src/components/ui
```

### Step 5: Import in main.jsx

```jsx
// main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Import the design system styles

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## 🎯 Usage Examples

### Buttons

```jsx
import Button from './components/ui/Button';
import { Plus, ArrowRight } from 'lucide-react';

// Variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// With Icons
<Button icon={Plus}>Add New</Button>
<Button icon={ArrowRight} iconPosition="right">Continue</Button>

// States
<Button loading>Saving...</Button>
<Button disabled>Disabled</Button>
```

### Inputs

```jsx
import Input from './components/ui/Input';
import { Search, Mail } from 'lucide-react';

<Input
  label="Email"
  placeholder="Enter your email"
  type="email"
/>

<Input
  label="Search"
  placeholder="Search..."
  icon={Search}
/>

<Input
  label="Password"
  type="password"
  error="Password is required"
/>

<Input
  label="Username"
  hint="This will be your public handle"
/>
```

### Cards

```jsx
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './components/ui/Card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description here</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// Hover effect
<Card hover>Clickable card</Card>
```

### Badges

```jsx
import Badge from './components/ui/Badge';

<Badge variant="primary">Primary</Badge>
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Failed</Badge>
<Badge variant="success" dot>Online</Badge>
```

### Avatar

```jsx
import Avatar from './components/ui/Avatar';

<Avatar name="John Doe" size="md" />
<Avatar src="/avatar.jpg" size="lg" />

// Sizes: xs, sm, md, lg, xl, 2xl
```

### Modal

```jsx
import Modal, { ModalFooter } from './components/ui/Modal';

const [isOpen, setIsOpen] = useState(false);

<Button onClick={() => setIsOpen(true)}>Open</Button>

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  description="Are you sure?"
>
  <p>Modal content here</p>
  
  <ModalFooter>
    <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
    <Button onClick={handleConfirm}>Confirm</Button>
  </ModalFooter>
</Modal>
```

### Toast Notifications

```jsx
// In App.jsx or main.jsx, wrap with provider:
import { ToastProvider } from './components/ui/Toast';

<ToastProvider>
  <App />
</ToastProvider>

// In any component:
import { useToast } from './components/ui/Toast';

function MyComponent() {
  const toast = useToast();

  const handleSave = () => {
    toast.success('Saved!', 'Your changes have been saved');
  };

  const handleError = () => {
    toast.error('Error', 'Something went wrong');
  };

  return <Button onClick={handleSave}>Save</Button>;
}
```

### Tabs

```jsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/Tabs';

<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="details">Details</TabsTrigger>
    <TabsTrigger value="settings">Settings</TabsTrigger>
  </TabsList>
  
  <TabsContent value="overview">
    Overview content
  </TabsContent>
  <TabsContent value="details">
    Details content
  </TabsContent>
  <TabsContent value="settings">
    Settings content
  </TabsContent>
</Tabs>
```

### Empty State

```jsx
import EmptyState from './components/ui/EmptyState';
import { Music } from 'lucide-react';

<EmptyState
  icon={Music}
  title="No services found"
  description="Try adjusting your filters"
  action={() => navigate('/create')}
  actionLabel="Create Service"
/>
```

### Loading

```jsx
import Spinner, { PageLoader, Skeleton } from './components/ui/Spinner';

// Spinner
<Spinner size="md" />

// Full page loader
<PageLoader />

// Skeleton
<Skeleton className="w-48 h-4" />
<Skeleton className="w-12 h-12 rounded-full" />
```

---

## 🎨 Color Palette

### Primary (Blue)
- `primary-500` - Main actions, links
- `primary-400` - Hover states
- `primary-600` - Active states

### Dark (Backgrounds)
- `dark-950` - Deepest background
- `dark-900` - Main background
- `dark-800` - Card backgrounds
- `dark-700` - Borders, dividers
- `dark-600` - Subtle borders
- `dark-500` - Placeholder text
- `dark-400` - Secondary text
- `dark-300` - Body text
- `dark-200` - Labels
- `dark-100` - Headings (near white)

### Semantic
- `success-500` - Success states
- `warning-500` - Warning states
- `error-500` - Error states
- `info-500` - Info states

---

## 📐 Spacing Scale

Based on Tailwind defaults + custom additions:
- `1` = 0.25rem (4px)
- `2` = 0.5rem (8px)
- `3` = 0.75rem (12px)
- `4` = 1rem (16px)
- `6` = 1.5rem (24px)
- `8` = 2rem (32px)
- `12` = 3rem (48px)
- `16` = 4rem (64px)

---

## 🔄 CSS Utility Classes

Pre-built in `index.css`:

```css
/* Container */
.container-app   /* max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 */

/* Cards */
.card            /* bg-dark-800 border border-dark-700 rounded-2xl */
.card-hover      /* + hover effects */

/* Glass effect */
.glass           /* bg-dark-800/50 backdrop-blur-xl */

/* Gradient text */
.text-gradient   /* Blue gradient text */

/* Glow */
.glow            /* Blue glow shadow */
.glow-lg         /* Larger glow */

/* Inputs & Buttons (base classes) */
.input-base
.btn, .btn-primary, .btn-secondary, .btn-outline, .btn-ghost, .btn-danger
.btn-sm, .btn-lg

/* Badges */
.badge, .badge-primary, .badge-success, .badge-warning, .badge-error, .badge-gray
```

---

## 🧪 Preview All Components

Add the demo page to see all components:

```jsx
// In your router
import DesignSystem from './pages/DesignSystem';

<Route path="/design-system" element={<DesignSystem />} />
```

Visit `/design-system` to see everything! 🎉

---

## ✅ Ready to Build!

Your design system is set up. Now you can build pages with consistent styling!

**Files:**
- [tailwind.config.js](computer:///mnt/user-data/outputs/tailwind.config.js)
- [index.css](computer:///mnt/user-data/outputs/index.css)
- [UI Components](computer:///mnt/user-data/outputs/ui-components)
- [DesignSystem.jsx](computer:///mnt/user-data/outputs/DesignSystem.jsx)