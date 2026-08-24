import React from 'react';
import { useTranslation } from 'react-i18next';
import { type ColumnDef } from '@tanstack/react-table';
import Card from '../../../components/ui/Card';
import DataTable from '../../../components/ui/DataTable';

const AuditLogPage: React.FC = () => {
  const { t } = useTranslation();

  const columns: ColumnDef<Record<string, unknown>>[] = [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
          {t('auditLog.title')}
        </h1>
      </div>
      <Card>
        <p className="text-muted mb-4">{t('auditLog.comingSoon')}</p>
        <DataTable columns={columns} data={[]} loading={false} />
      </Card>
    </div>
  );
};

export default AuditLogPage;
