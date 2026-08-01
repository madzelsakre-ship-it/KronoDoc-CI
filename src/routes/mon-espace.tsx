import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/mon-espace')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/mon-espace"!</div>
}
