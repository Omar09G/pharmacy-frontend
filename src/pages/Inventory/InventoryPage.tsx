import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { type ColumnDef } from '@tanstack/react-table';
import { inventoryApi } from '../../services/inventoryApi';
import type {
  InventoryMovement,
  ProductLot,
} from '../../models/inventory.model';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants';
import { formatLocal, getCurrentDate, nowUTC } from '../../utils/dateUtils';
import Card from '../../components/ui/Card';
import DataTable from '../../components/ui/DataTable';
import Pagination from '../../components/ui/Pagination';
import DateRangeInput from '../../components/ui/DateRangeInput';
import Button from '../../components/ui/Button';
import { BanIcon, PencilIcon, Plus, SaveIcon } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import { z } from 'zod';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCrudModal } from '../../hooks/useCrudModal';
import { showError, showSuccess, showApiError } from '../../utils/alerts';
import Modal from '../../components/ui/Modal';
const InventoryPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [dateInit, setDateInit] = useState(getCurrentDate());
  const [dateEnd, setDateEnd] = useState(getCurrentDate());
  const [operationType, setOperationType] = useState<
    'update' | 'adjust' | 'lowStock'
  >('update');
  //Agrega CRUD de Actualizar y Ajustar stock
  const schema = z.object({
    id: z.coerce.number<number>().min(0).catch(0),
    barcode: z.string().min(1, 'Requerido'),
    productId: z.coerce.number<number>().min(0).catch(0),
    lotNumber: z.string().min(1, 'Requerido'),
    qtyOnHand: z.coerce.number<number>().min(0).catch(0),
    expiryDate: z.string().catch(''),
    purchaseId: z.coerce.number<number>().min(0).catch(0),
    createdAt: z.string().catch(nowUTC()),
  });
  type FormDataStock = z.infer<typeof schema>;

  const formDataStock = useForm<FormDataStock>({
    resolver: zodResolver(schema) as unknown as Resolver<FormDataStock>,
  });

  const { open, editing, openCreate, close } = useCrudModal<ProductLot>();

  const updateMutStock = useMutation({
    mutationFn: ({
      id,
      data: d,
      typeOperation,
    }: {
      id: number;
      data: FormDataStock;
      typeOperation: string;
    }) =>
      inventoryApi.updateStock(
        id,
        {
          ...d,
          expiryDate: d.expiryDate ? nowUTC().split('T')[0] : d.expiryDate,
        },
        typeOperation,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory'] });
      showSuccess(t('inventory.updated'));
      close();
    },
    onError: (err) => showApiError(err),
  });

  const onSubmitStock = (d: FormDataStock, typeOperation?: string) => {
    if (editing) {
      updateMutStock.mutate({
        id: editing.id,
        data: d,
        typeOperation: typeOperation || '',
      });
    } else {
      updateMutStock.mutate({
        id: d.id,
        data: { ...d, createdAt: nowUTC() },

        typeOperation: typeOperation || '',
      });
    }
  };

  const handleCreate = () => {
    openCreate();
    setTimeout(
      () =>
        formDataStock.reset({
          id: 0,
          barcode: '',
          productId: 0,
          lotNumber: '',
          qtyOnHand: 0,
          expiryDate: new Date().toISOString().split('T')[0],
          purchaseId: 0,
        }),
      10,
    );
  };

  const handleViewStock = () => {
    handleCreate();
  };

  const { data, isLoading } = useQuery({
    queryKey: ['inventory', page, dateInit, dateEnd],
    queryFn: () =>
      inventoryApi.getMovements(page, DEFAULT_PAGE_SIZE, 0, dateInit, dateEnd),
  });
  const items = Array.isArray(data?.data) ? data.data : [];
  const total = data?.total ?? 0;

  const columns: ColumnDef<InventoryMovement>[] = [
    {
      header: t('inventory.inventoryMovement.id'),
      accessorKey: 'id',
    },
    {
      header: t('inventory.inventoryMovement.movementType'),
      accessorKey: 'reason',
      cell: ({ getValue }) => {
        const reason = getValue() as string;
        return (
          <Badge color={reason === 'sale' ? 'green' : 'red'}>{reason}</Badge>
        );
      },
    },
    {
      header: t('inventory.inventoryMovement.quantity'),
      accessorKey: 'changeQty',
    },
    {
      header: t('inventory.inventoryMovement.referenceType'),
      accessorKey: 'referenceType',
    },
    {
      header: t('inventory.inventoryMovement.saleId'),
      accessorKey: 'referenceId',
      cell: ({ getValue }) => {
        const referenceId = getValue() as string;
        return (
          <Badge color={referenceId ? 'purple' : 'red'}>{referenceId}</Badge>
        );
      },
    },
    {
      header: t('inventory.inventoryMovement.createdAt'),
      accessorKey: 'createdAt',
      cell: (info) => formatLocal(info.getValue() as string, i18n.language),
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
        {t('inventory.title')}
      </h1>
      <div className="flex items-center justify-end gap-4">
        <Button
          variant="tertiary"
          onClick={() => {
            setOperationType('update');
            handleViewStock();
          }}
        >
          <Plus size={16} /> {t('inventory.updateStock')}
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            setOperationType('adjust');
            handleViewStock();
          }}
        >
          <Plus size={16} /> {t('inventory.adjustStock')}
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            setOperationType('lowStock');
            handleViewStock();
          }}
        >
          <Plus size={16} /> {t('inventory.lowStock')}
        </Button>
      </div>
      <Card>
        <DateRangeInput
          dateInit={dateInit}
          dateEnd={dateEnd}
          onDateInitChange={(v) => {
            setDateInit(v);
            setPage(1);
          }}
          onDateEndChange={(v) => {
            setDateEnd(v);
            setPage(1);
          }}
          labelInit={t('common.dateFrom')}
          labelEnd={t('common.dateTo')}
          className="mb-4"
        />
        <DataTable columns={columns} data={items} loading={isLoading} />
        <Pagination
          page={page}
          totalItems={total}
          pageSize={DEFAULT_PAGE_SIZE}
          onPageChange={setPage}
        />
      </Card>
      <Modal
        open={open}
        onClose={close}
        title={t('inventory.title')}
        footer={
          <>
            <Button onClick={close} variant="ghost" size="sm">
              <BanIcon size={16} className="text-blue-500" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={formDataStock.handleSubmit((data) =>
                onSubmitStock(data, operationType),
              )}
              loading={updateMutStock.isPending}
            >
              {editing ? (
                <PencilIcon size={16} className="text-black-500" />
              ) : (
                <SaveIcon size={16} className="text-green-500" />
              )}
            </Button>
          </>
        }
      >
        <form
          onSubmit={formDataStock.handleSubmit((data) =>
            onSubmitStock(data, operationType),
          )}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <Input
            placeholder={t('inventory.barcode')}
            label={t('inventory.barcode')}
            {...formDataStock.register('barcode')}
            error={formDataStock.formState.errors.barcode?.message}
            //PRECIONE ENTER y tab PARA BUSCAR POR CODIGO DE BARRAS Y COMPLETAR LOS CAMPOS RESTANTES
            onKeyDown={async (e) => {
              if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault();
                const barcode = formDataStock.getValues('barcode');
                try {
                  const res = await inventoryApi.getStockByBarCode(barcode);
                  if (res.data) {
                    formDataStock.setValue('id', res.data.id);
                    formDataStock.setValue('productId', res.data.productId);
                    formDataStock.setValue('lotNumber', res.data.lotNumber);
                    formDataStock.setValue('qtyOnHand', res.data.qtyOnHand);
                    formDataStock.setValue(
                      'expiryDate',
                      res.data.expiryDate
                        ? new Date(res.data.expiryDate)
                            .toISOString()
                            .split('T')[0]
                        : new Date().toISOString().split('T')[0],
                    );
                    formDataStock.setValue('purchaseId', res.data.purchaseId);
                  } else {
                    showError(t('inventory.notFound'));
                  }
                } catch {
                  showError(t('inventory.notFound'));
                }
              }
            }}
          />
          <Input
            label={t('inventory.title')}
            {...formDataStock.register('id')}
            error={formDataStock.formState.errors.id?.message}
            disabled={true}
          />
          <Input
            label={t('inventory.inventoryMovement.productId')}
            {...formDataStock.register('productId')}
            error={formDataStock.formState.errors.productId?.message}
            disabled={true}
          />
          <Input
            label={t('inventory.inventoryMovement.locationId')}
            {...formDataStock.register('lotNumber')}
            error={formDataStock.formState.errors.lotNumber?.message}
            disabled={true}
          />
          <Input
            label={
              operationType === 'update'
                ? t('inventory.inventoryMovement.quantity') +
                  ' (' +
                  t('inventory.updateStock') +
                  '): '
                : t('inventory.inventoryMovement.quantity') +
                  ' (' +
                  t('inventory.adjustStock') +
                  ') : '
            }
            type="number"
            {...formDataStock.register('qtyOnHand')}
            error={formDataStock.formState.errors.qtyOnHand?.message}
          />
          <Input
            label={t('inventory.inventoryMovement.createdAt')}
            type="date"
            {...formDataStock.register('expiryDate')}
            error={formDataStock.formState.errors.expiryDate?.message}
          />
          <Input
            label={t('inventory.inventoryMovement.referenceId')}
            type="number"
            {...formDataStock.register('purchaseId')}
            error={formDataStock.formState.errors.purchaseId?.message}
            disabled={true}
          />
        </form>
      </Modal>
    </div>
  );
};

export default InventoryPage;
