import { PageHeader } from '@/components/layout/topbar'
import { DocumentsList } from '@/components/documents/documents-list'

export const metadata = {
  title: 'Documents',
}

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <PageHeader>Documents</PageHeader>
        <p className="text-sm text-muted-foreground mt-0.5">
          Upload and manage all team documents and files.
        </p>
      </div>
      <DocumentsList />
    </div>
  )
}