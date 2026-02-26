// pages/DesignSystem.jsx
// Preview all UI components

import { useState } from 'react';
import { Search, Plus, ArrowRight, Trash2, Music } from 'lucide-react';

import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Select from '../components/ui/Select';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import Modal, { ModalFooter } from '../components/ui/Modal';
import Spinner, { Skeleton } from '../components/ui/Spinner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import EmptyState from '../components/ui/EmptyState';

export default function DesignSystem() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-dark-900 p-8">
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Design System</h1>
          <p className="text-dark-400">Dark mode • Blue primary • Minimal • Rounded</p>
        </div>

        {/* Buttons */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-6">Buttons</h2>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button icon={Plus}>With Icon</Button>
              <Button icon={ArrowRight} iconPosition="right">Continue</Button>
              <Button loading>Loading</Button>
              <Button disabled>Disabled</Button>
            </div>
          </div>
        </section>

        {/* Inputs */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-6">Inputs</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Input label="Email" placeholder="Enter your email" type="email" />
            <Input label="Search" placeholder="Search..." icon={Search} />
            <Input label="With Error" placeholder="Enter value" error="This field is required" />
            <Input label="With Hint" placeholder="@username" hint="This will be your public handle" />
            <Select
              label="Category"
              placeholder="Select a category"
              options={[
                { value: 'collab', label: 'Collaboration' },
                { value: 'loop', label: 'Loop Pack' },
                { value: 'drum', label: 'Drum Kit' },
              ]}
            />
            <Textarea label="Description" placeholder="Write a description..." rows={3} />
          </div>
        </section>

        {/* Cards */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-6">Cards</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Card</CardTitle>
                <CardDescription>A simple card</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-dark-400">Card content here.</p>
              </CardContent>
            </Card>

            <Card hover>
              <CardHeader>
                <CardTitle>Hover Card</CardTitle>
                <CardDescription>Hover over me!</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-dark-400">Interactive card.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>With Footer</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-dark-400">Card with actions.</p>
              </CardContent>
              <CardFooter>
                <Button size="sm">Action</Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* Badges */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-6">Badges</h2>
          <div className="flex flex-wrap gap-3">
            <Badge variant="primary">Primary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="gray">Gray</Badge>
            <Badge variant="success" dot>With Dot</Badge>
            <Badge variant="primary" size="lg">Large</Badge>
          </div>
        </section>

        {/* Avatars */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-6">Avatars</h2>
          <div className="flex items-end gap-4">
            <Avatar name="John Doe" size="xs" />
            <Avatar name="Jane Smith" size="sm" />
            <Avatar name="Bob Wilson" size="md" />
            <Avatar name="Alice Brown" size="lg" />
            <Avatar name="Charlie Davis" size="xl" />
            <Avatar name="Eve Miller" size="2xl" />
          </div>
        </section>

        {/* Tabs */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-6">Tabs</h2>
          <Tabs defaultValue="tab1">
            <TabsList>
              <TabsTrigger value="tab1">Overview</TabsTrigger>
              <TabsTrigger value="tab2">Details</TabsTrigger>
              <TabsTrigger value="tab3">Settings</TabsTrigger>
            </TabsList>
            <div className="mt-4">
              <TabsContent value="tab1">
                <Card padding="md">
                  <p className="text-dark-400">Overview content</p>
                </Card>
              </TabsContent>
              <TabsContent value="tab2">
                <Card padding="md">
                  <p className="text-dark-400">Details content</p>
                </Card>
              </TabsContent>
              <TabsContent value="tab3">
                <Card padding="md">
                  <p className="text-dark-400">Settings content</p>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </section>

        {/* Modal */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-6">Modal</h2>
          <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Modal Title"
            description="This is the modal description"
          >
            <p className="text-dark-400">Modal content goes here.</p>
            <ModalFooter>
              <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button onClick={() => setModalOpen(false)}>Confirm</Button>
            </ModalFooter>
          </Modal>
        </section>

        {/* Loading */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-6">Loading</h2>
          <div className="flex items-center gap-6">
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" />
            <Spinner size="xl" />
          </div>
          <div className="flex gap-4 mt-6">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="w-48 h-4" />
              <Skeleton className="w-32 h-4" />
            </div>
          </div>
        </section>

        {/* Empty State */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-6">Empty State</h2>
          <Card>
            <EmptyState
              icon={Music}
              title="No services found"
              description="Try adjusting your filters or create a new service"
              action={() => alert('Create clicked!')}
              actionLabel="Create Service"
            />
          </Card>
        </section>
      </div>
    </div>
  );
}