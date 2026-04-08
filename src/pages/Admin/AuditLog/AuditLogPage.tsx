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
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          {t('auditLog.title')}
        </h1>
      </div>
      <Card>
        <p className="text-neutral-500 dark:text-neutral-400 mb-4">
          {t('auditLog.comingSoon')}
        </p>
        <DataTable columns={columns} data={[]} loading={false} />
      </Card>
    </div>
  );
};

export default AuditLogPage;
